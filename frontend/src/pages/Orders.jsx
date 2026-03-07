import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { getMyOrdersAPI, cancelOrderAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import { FiPackage, FiChevronDown, FiChevronUp, FiMapPin, FiPhone, FiUser, FiCreditCard, FiTruck, FiSearch } from 'react-icons/fi';

const Orders = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        getMyOrdersAPI().then(r => setOrders(r.data.orders || [])).catch(() => { }).finally(() => setLoading(false));
    }, [user]);

    const handleCancel = async (id) => {
        if (!confirm('Cancel this order?')) return;
        try {
            await cancelOrderAPI(id);
            setOrders(o => o.map(order => order._id === id ? { ...order, status: 'cancelled' } : order));
            toast.success('Order cancelled');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const toggleDetails = (id) => {
        setExpandedOrder(prev => prev === id ? null : id);
    };

    const paymentMethodLabels = {
        cod: 'Cash on Delivery',
        stripe: 'Stripe',
        sslcommerz: 'SSLCommerz',
        bkash: 'bKash',
        nagad: 'Nagad'
    };

    const filteredOrders = orders.filter(order => {
        const s = searchTerm.toLowerCase();
        if (!s) return true;
        return (
            order._id.toLowerCase().includes(s) ||
            order.shippingAddress?.phone?.includes(s) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(s) ||
            `#${order._id.slice(-8).toUpperCase()}`.toLowerCase().includes(s)
        );
    });

    if (loading) return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;

    return (
        <div className="page"><div className="container">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}><FiPackage style={{ marginRight: '8px' }} />Order History</h1>

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="form-input"
                            placeholder="Search by order ID, name or phone number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => { }}>Search</button>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">{searchTerm ? '🔍' : '📦'}</div>
                    <h3>{searchTerm ? 'No matching orders' : 'No orders yet'}</h3>
                    <p>{searchTerm ? 'Try a different search term' : 'Start shopping to see your orders here'}</p>
                    {searchTerm && <button className="btn btn-outline" onClick={() => setSearchTerm('')} style={{ marginTop: '12px' }}>Clear Search</button>}
                </div>
            ) : filteredOrders.map(order => (
                <div key={order._id} className="order-card fade-in">
                    <div className="order-header">
                        <div><span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span></div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className={`status-badge status-${order.status}`}>{order.status}</span>
                            <span className={`status-badge status-${order.paymentStatus}`}>{order.paymentStatus}</span>
                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="order-items">
                        {order.items?.map((item, i) => (
                            <div key={i} className="order-item-row">
                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                    {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                                        <span>Qty: {item.quantity}</span>
                                        {item.size && <span>• Size: {item.size}</span>}
                                        {item.color && <span>• Color: {item.color}</span>}
                                    </div>
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>৳{(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    {/* Expandable Details Section */}
                    {expandedOrder === order._id && (
                        <div className="order-details-expanded">
                            {/* Shipping Address */}
                            {order.shippingAddress && (
                                <div className="order-detail-block">
                                    <h4 className="order-detail-title">
                                        <FiMapPin style={{ color: 'var(--accent-light)' }} />
                                        Shipping Address
                                    </h4>
                                    <div className="order-detail-grid">
                                        <div className="order-detail-item">
                                            <FiUser className="order-detail-icon" />
                                            <div>
                                                <span className="order-detail-label">Full Name</span>
                                                <span className="order-detail-value">{order.shippingAddress.fullName}</span>
                                            </div>
                                        </div>
                                        <div className="order-detail-item">
                                            <FiPhone className="order-detail-icon" />
                                            <div>
                                                <span className="order-detail-label">Phone</span>
                                                <span className="order-detail-value">{order.shippingAddress.phone}</span>
                                            </div>
                                        </div>
                                        <div className="order-detail-item full-width">
                                            <FiMapPin className="order-detail-icon" />
                                            <div>
                                                <span className="order-detail-label">Address</span>
                                                <span className="order-detail-value">
                                                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
                                                    {order.shippingAddress.zipCode && ` - ${order.shippingAddress.zipCode}`}
                                                    {order.shippingAddress.country && `, ${order.shippingAddress.country}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment & Price Breakdown */}
                            <div className="order-detail-block">
                                <h4 className="order-detail-title">
                                    <FiCreditCard style={{ color: 'var(--accent-light)' }} />
                                    Payment & Price Breakdown
                                </h4>
                                <div className="order-detail-grid">
                                    <div className="order-detail-item">
                                        <FiCreditCard className="order-detail-icon" />
                                        <div>
                                            <span className="order-detail-label">Payment Method</span>
                                            <span className="order-detail-value">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                                        </div>
                                    </div>
                                    <div className="order-detail-item">
                                        <FiTruck className="order-detail-icon" />
                                        <div>
                                            <span className="order-detail-label">Delivery Status</span>
                                            <span className="order-detail-value">
                                                {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Not yet delivered'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-price-breakdown">
                                    <div className="price-row">
                                        <span>Items Price</span>
                                        <span>৳{order.itemsPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Shipping</span>
                                        <span>{order.shippingPrice === 0 ? 'Free' : `৳${order.shippingPrice?.toLocaleString()}`}</span>
                                    </div>
                                    {order.couponApplied && (
                                        <div className="price-row coupon-row">
                                            <span>Coupon ({order.couponApplied.code})</span>
                                            <span>-৳{order.couponApplied.discount?.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="price-row price-total">
                                        <span>Total</span>
                                        <span>৳{order.totalPrice?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="order-footer">
                        <div style={{ fontWeight: 700, color: 'var(--accent-light)' }}>Total: ৳{order.totalPrice?.toLocaleString()}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => toggleDetails(order._id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                                {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                            </button>
                            {['pending', 'processing'].includes(order.status) && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)}>Cancel Order</button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div></div>
    );
};

export default Orders;

