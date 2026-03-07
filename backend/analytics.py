import sys
import json
from datetime import datetime
import os
from typing import List, Dict, Any, Optional

def parse_date(date_str: Any) -> Optional[datetime]:
    if not date_str or not isinstance(date_str, str):
        return None
    try:
        # Standard ISO format with Z or timezone offset
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        try:
            # Short date format YYYY-MM-DD
            s_date: str = str(date_str)
            if len(s_date) >= 10:
                return datetime.strptime(s_date[:10], "%Y-%m-%d")
            return None
        except:
            return None

def analyze(mode: str, start_date_str: str, end_date_str: str, data_dir: str, search_query: str = '', is_mobile: str = 'false') -> Dict[str, Any]:
    if not os.path.isdir(str(data_dir)):
        return {"error": f"Data directory not found: {data_dir}"}

    def load_file(name: str) -> List[Any]:
        p = os.path.join(str(data_dir), f"{name}.json")
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                content = json.load(f)
                if isinstance(content, list):
                    return content
        return []

    orders: List[Dict[str, Any]] = load_file('orders')
    users: List[Dict[str, Any]] = load_file('users')
    products: List[Dict[str, Any]] = load_file('products')

    start_date = parse_date(start_date_str)
    end_date = parse_date(end_date_str)

    # Filter by date
    filtered_orders: List[Dict[str, Any]] = []
    for o in orders:
        o_date_str = o.get('createdAt')
        o_date = parse_date(o_date_str)
        if not o_date or not isinstance(o_date, datetime):
            continue
            
        in_range = True
        # If start_date is provided, order must be >= start_date
        if start_date is not None and isinstance(start_date, datetime):
            if o_date < start_date:
                in_range = False
        # If end_date is provided, order must be <= end_date
        if in_range and end_date is not None and isinstance(end_date, datetime):
            if o_date > end_date:
                in_range = False
            
        if in_range:
            # Filter by search query
            if search_query:
                s = str(search_query).lower()
                user = next((u for u in users if u['_id'] == o.get('user')), None)
                matches = (
                    s in str(o.get('_id', '')).lower() or
                    s in str(o.get('orderNumber', '')).lower() or
                    (user and (s in str(user.get('name', '')).lower() or s in str(user.get('email', '')).lower())) or
                    s in str(o.get('shippingAddress', {}).get('phone', '')).lower() or
                    s in str(o.get('shippingAddress', {}).get('fullName', '')).lower()
                )
                if not matches:
                    in_range = False

            # Filter by mobile payment
            if is_mobile == 'true':
                is_m = o.get('paymentInfo') or o.get('paymentMethod') in ['bkash', 'nagad']
                if not is_m:
                    in_range = False

            if in_range:
                # Attach user info for convenience
                u = next((u for u in users if u['_id'] == o.get('user')), None)
                o['user'] = {"_id": u['_id'], "name": u['name'], "email": u['email']} if u else None
                filtered_orders.append(o)

    if mode == 'dashboard':
        active_orders = [o for o in filtered_orders if o['status'] not in ['cancelled', 'refunded']]
        delivered_orders = [o for o in filtered_orders if o['status'] == 'delivered']
        total_revenue = sum(float(o.get('totalPrice', 0)) for o in active_orders)
        
        cancelled_orders = [o for o in filtered_orders if o['status'] in ['cancelled', 'refunded']]
        cancelled_revenue = sum(float(o.get('totalPrice', 0)) for o in cancelled_orders)

        # Recent orders (latest 20)
        all_sorted = sorted(filtered_orders, key=lambda x: str(x.get('createdAt', '')), reverse=True)
        recent = list(all_sorted[:20])
        
        # Best selling
        prod_sorted = sorted(products, key=lambda x: int(x.get('sold', 0)), reverse=True)
        top_prods = list(prod_sorted[:5])
        best_selling = [{"_id": p['_id'], "name": p['name'], "price": p['price'], "sold": p['sold'], "images": p.get('images', [])} for p in top_prods]

        # Status distribution
        dist: Dict[str, int] = {}
        for o in filtered_orders:
            st = str(o.get('status', 'pending'))
            dist[st] = dist.get(st, 0) + 1
        dist_list = [{"_id": k, "count": v} for k, v in dist.items()]

        return {
            "totalUsers": len(users),
            "totalProducts": len(products),
            "totalOrders": len(delivered_orders),
            "totalRevenue": total_revenue,
            "cancelledRevenue": cancelled_revenue,
            "cancelledOrders": len(cancelled_orders),
            "bestSelling": best_selling,
            "recentOrders": recent,
            "orderStatusDist": dist_list
        }
    else:
        # mode == 'list'
        # Sort by latest
        filtered_orders.sort(key=lambda x: str(x.get('createdAt', '')), reverse=True)
        return {
            "orders": filtered_orders,
            "total": len(filtered_orders)
        }

if __name__ == "__main__":
    try:
        # usage: python analytics.py mode start_date end_date data_dir search_query is_mobile
        mode_arg = sys.argv[1] if len(sys.argv) > 1 else 'dashboard'
        start_arg = sys.argv[2] if len(sys.argv) > 2 else ''
        end_arg = sys.argv[3] if len(sys.argv) > 3 else ''
        dir_arg = sys.argv[4] if len(sys.argv) > 4 else 'data'
        query_arg = sys.argv[5] if len(sys.argv) > 5 else ''
        mobile_arg = sys.argv[6] if len(sys.argv) > 6 else 'false'

        result_dict = analyze(mode_arg, start_arg, end_arg, dir_arg, query_arg, mobile_arg)
        sys.stdout.write(json.dumps(result_dict))
    except Exception as exc:
        sys.stdout.write(json.dumps({"error": str(exc)}))
