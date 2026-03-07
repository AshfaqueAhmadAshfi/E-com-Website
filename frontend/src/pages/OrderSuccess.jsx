import { Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';

const OrderSuccess = () => {
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ color: 'var(--success)', fontSize: '5rem', marginBottom: '24px' }}>
                    <FiCheckCircle />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '16px' }}>Order Placed!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '32px' }}>
                    Thank you for shopping with <strong>X-Look</strong>. Your order has been received and is being processed.
                </p>

                <div className="card" style={{ padding: '32px', marginBottom: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>What happens next?</div>
                    <ul style={{ textAlign: 'left', color: 'var(--text-secondary)', lineHeight: '1.8', margin: '0 0 24px 20px' }}>
                        <li>You will receive a confirmation call on your provided phone number.</li>
                        <li>Your order will be packed and shipped via Steadfast Courier.</li>
                        <li>You can track your order status in your profile.</li>
                    </ul>
                    <Link to="/orders" className="btn btn-primary btn-block btn-lg" style={{ background: 'var(--gradient-1)' }}>
                        <FiPackage /> View My Orders
                    </Link>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Link to="/" className="btn btn-outline">
                        Continue Shopping <FiArrowRight />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
