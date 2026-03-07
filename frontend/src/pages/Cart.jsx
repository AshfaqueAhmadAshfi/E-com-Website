import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Cart = () => {
    const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
    const shipping = totalPrice > 5000 ? 0 : 100;
    const tax = Math.round(totalPrice * 0.05);

    if (items.length === 0) {
        return (
            <div className="page"><div className="container">
                <div className="empty-state">
                    <div className="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Explore our products and add items to your cart</p>
                    <Link to="/products" className="btn btn-primary"><FiShoppingBag /> Shop Now</Link>
                </div>
            </div></div>
        );
    }

    return (
        <div className="page"><div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Shopping Cart ({items.length})</h1>
                <button className="btn btn-secondary btn-sm" onClick={clearCart}>Clear Cart</button>
            </div>

            <div className="cart-page">
                <div>
                    {items.map(item => (
                        <div key={item.cartKey || item._id} className="cart-item fade-in">
                            <div className="cart-item-img">
                                {item.image ? <img src={item.image} alt={item.name} /> : <span style={{ fontSize: '2rem' }}>📦</span>}
                            </div>
                            <div className="cart-item-info">
                                <Link to={`/product/${item._id}`} className="cart-item-name">{item.name}</Link>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                    {item.size && (
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                                            color: '#fff',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            fontWeight: 700
                                        }}>
                                            Size: {item.size}
                                        </span>
                                    )}
                                    {item.color && (
                                        <span style={{
                                            padding: '2px 10px',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border)',
                                            color: 'var(--text-secondary)',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color.toLowerCase() }} />
                                            {item.color}
                                        </span>
                                    )}
                                </div>
                                <div className="cart-item-price">৳{item.price.toLocaleString()}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                                    <div className="cart-quantity">
                                        <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity - 1)}><FiMinus /></button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cartKey || item._id, item.quantity + 1)}><FiPlus /></button>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Subtotal: <strong style={{ color: 'var(--text-primary)' }}>৳{(item.price * item.quantity).toLocaleString()}</strong></span>
                                    <button onClick={() => removeFromCart(item.cartKey || item._id)} style={{ marginLeft: 'auto', background: 'none', color: 'var(--danger)', fontSize: '1.1rem' }}><FiTrash2 /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row"><span>Subtotal</span><span>৳{totalPrice.toLocaleString()}</span></div>
                    <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `৳${shipping}`}</span></div>
                    <div className="summary-row"><span>Tax (5%)</span><span>৳{tax.toLocaleString()}</span></div>
                    <div className="summary-row total"><span>Total</span><span>৳{(totalPrice + shipping + tax).toLocaleString()}</span></div>
                    {totalPrice < 5000 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Add ৳{(5000 - totalPrice).toLocaleString()} more for free shipping!</p>}
                    <Link to="/checkout" className="btn btn-primary btn-block" style={{ marginTop: '16px' }}>Proceed to Checkout <FiArrowRight /></Link>
                    <Link to="/products" className="btn btn-secondary btn-block" style={{ marginTop: '8px' }}>Continue Shopping</Link>
                </div>
            </div>
        </div></div>
    );
};

export default Cart;
