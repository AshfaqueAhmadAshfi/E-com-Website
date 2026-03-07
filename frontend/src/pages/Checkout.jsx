import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { createOrderAPI, validateCouponAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import { FiTruck, FiCheck } from 'react-icons/fi';

// Bangladesh City & Area Data
const AREA_DATA = {
    'Dhaka': ['Uttara', 'Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Badda', 'Mohammadpur', 'Motijheel', 'Jatrabari', 'Old Dhaka', 'Gabtoli', 'Malibagh', 'Rampura'],
    'Narayanganj': [],
    'Gazipur': [],
    'Savar': [],
    'Tangail': [],
    'Manikganj': [],
    'Narsingdi': [],
    'Kishoreganj': [],
    'Jamalpur': [],
    'Mymensingh': [],
    'Chittagong': ['Chittagong City', 'Cox’s Bazar', 'Comilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Noakhali', 'Khagrachhari', 'Rangamati', 'Bandarban'],
    'Khulna': ['Khulna City', 'Jessore', 'Satkhira', 'Bagerhat', 'Narail', 'Chuadanga', 'Meherpur', 'Magura', 'Jhenaidah'],
    'Rajshahi': ['Rajshahi City', 'Bogura', 'Pabna', 'Naogaon', 'Natore', 'Joypurhat', 'Sirajganj', 'Chapai Nawabganj'],
    'Sylhet': ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    'Barisal': ['Barisal City', 'Patuakhali', 'Bhola', 'Jhalokathi', 'Pirojpur', 'Barguna'],
    'Rangpur': ['Rangpur City', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Nilphamari', 'Lalmonirhat', 'Kurigram', 'Gaibandha']
};

const Checkout = () => {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [address, setAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
    });

    if (!user) { navigate('/login'); return null; }
    if (items.length === 0) { navigate('/cart'); return null; }

    // Dynamic shipping based on city
    // Dhaka: 70tk, Others: 130tk
    const shipping = address.city === 'Dhaka' ? 70 : 130;
    const grandTotal = totalPrice + shipping - couponDiscount;

    const handleCoupon = async () => {
        try {
            const { data } = await validateCouponAPI({ code: couponCode, orderAmount: totalPrice });
            setCouponDiscount(data.coupon.discount);
            toast.success(`Coupon applied! Save ৳${data.coupon.discount}`);
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); setCouponDiscount(0); }
    };

    const handleOrder = async (e) => {
        e.preventDefault();

        // Basic required checks
        if (!address.fullName || !address.phone || !address.street || !address.city) {
            return toast.error('Please fill in all required fields marked with *');
        }

        // Phone number validation: must be 11 digits
        if (address.phone.length !== 11) {
            return toast.error('Phone number MUST be exactly 11 digits (e.g., 01700000000)');
        }

        setLoading(true);
        try {
            const orderData = {
                items: items.map(i => ({ product: i._id, quantity: i.quantity, size: i.size || null, color: i.color || null })),
                shippingAddress: { ...address, country: 'Bangladesh' },
                paymentMethod,
                couponCode: couponDiscount > 0 ? couponCode : undefined
            };
            const { data } = await createOrderAPI(orderData);
            clearCart();

            if (paymentMethod === 'bkash') {
                navigate(`/payment/bkash?orderId=${data.order._id}&amount=${grandTotal}`);
            } else if (paymentMethod === 'nagad') {
                navigate(`/payment/nagad?orderId=${data.order._id}&amount=${grandTotal}`);
            } else {
                toast.success('Order placed successfully!');
                navigate('/order-success');
            }
        } catch (err) { toast.error(err.response?.data?.message || 'Error placing order'); }
        finally { setLoading(false); }
    };

    const payments = [
        { id: 'cod', name: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
        { id: 'bkash', name: 'bKash', logo: '/bkash.png', desc: 'Secure Mobile Payment' },
        { id: 'nagad', name: 'Nagad', logo: '/nagad.png', desc: 'Fast Mobile Payment' },
    ];

    return (
        <div className="page"><div className="container">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Checkout</h1>
            <form onSubmit={handleOrder}>
                <div className="checkout-layout">
                    <div>
                        <div className="checkout-section">
                            <h3><FiTruck style={{ marginRight: '8px' }} /> Delivery Information</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} placeholder="আপনার নাম" required /></div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        className="form-input"
                                        value={address.phone}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 11) setAddress(a => ({ ...a, phone: val }));
                                        }}
                                        placeholder="01XXXXXXXXX"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group"><label className="form-label">Full Address *</label><input className="form-input" value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="বাসা নং, রাস্তা, এলাকা" required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">City / District *</label>
                                    <select
                                        className="form-input form-select"
                                        value={address.city}
                                        onChange={e => {
                                            const newCity = e.target.value;
                                            setAddress(a => ({ ...a, city: newCity, state: '' })); // Reset area when city changes
                                        }}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {Object.keys(AREA_DATA).map(city => <option key={city} value={city}>{city}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{address.city && AREA_DATA[address.city]?.length > 0 ? 'Area / State *' : 'Area / State'}</label>
                                    {address.city && AREA_DATA[address.city]?.length > 0 ? (
                                        <select
                                            className="form-input form-select"
                                            value={address.state}
                                            onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                            required
                                        >
                                            <option value="">Select Area</option>
                                            {AREA_DATA[address.city].map(area => <option key={area} value={area}>{area}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            className="form-input"
                                            value={address.state}
                                            onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                            placeholder="Area name (Optional)"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="checkout-section">
                            <h3>💳 Payment Method</h3>
                            <div className="payment-options">
                                {payments.map(p => (
                                    <div key={p.id} className={`payment-option ${paymentMethod === p.id ? 'selected' : ''}`} onClick={() => setPaymentMethod(p.id)}>
                                        <div className="payment-radio" />
                                        {p.logo ? (
                                            <img src={p.logo} alt={p.name} style={{ height: '32px', objectFit: 'contain' }} />
                                        ) : (
                                            <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                                        )}
                                        <div><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.desc}</div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            {items.map(item => (
                                <div key={item.cartKey || item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            Qty: {item.quantity}
                                            {item.size ? ` • Size: ${item.size}` : ''}
                                            {item.color ? ` • Color: ${item.color}` : ''}
                                        </div>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>৳{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}

                            <div className="coupon-input" style={{ marginTop: '16px' }}>
                                <input className="form-input" placeholder="Coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ fontSize: '0.85rem' }} />
                                <button type="button" className="btn btn-secondary btn-sm" onClick={handleCoupon}>Apply</button>
                            </div>

                            <div className="summary-row" style={{ marginTop: '12px' }}><span>Subtotal</span><span>৳{totalPrice.toLocaleString()}</span></div>
                            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>Free</span> : `৳${shipping}`}</span></div>
                            {couponDiscount > 0 && <div className="summary-row" style={{ color: 'var(--success)' }}><span>Coupon Discount</span><span>-৳{couponDiscount.toLocaleString()}</span></div>}
                            <div className="summary-row total"><span>Total</span><span>৳{grandTotal.toLocaleString()}</span></div>

                            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '16px' }}>
                                {loading ? 'Processing...' : (
                                    <>
                                        <FiCheck />
                                        {paymentMethod === 'cod' ? ' Place Order' : ` Pay with ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div></div>
    );
};

export default Checkout;
