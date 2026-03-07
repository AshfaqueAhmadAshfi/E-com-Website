import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { submitPaymentInfoAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import { FiSmartphone, FiCheckCircle, FiInfo, FiCopy } from 'react-icons/fi';

const PaymentGateway = () => {
    const { type } = useParams(); // 'bkash' or 'nagad'
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const orderId = query.get('orderId');
    const amount = query.get('amount');

    const [form, setForm] = useState({ senderNumber: '', amountSent: amount || '', transactionId: '' });
    const [loading, setLoading] = useState(false);

    const gatewayInfo = {
        bkash: { name: 'bKash', number: '01867837855', color: '#d12053', logo: '/bkash.png' },
        nagad: { name: 'Nagad', number: '01531817299', color: '#f7941d', logo: '/nagad.png' }
    };

    const info = gatewayInfo[type] || gatewayInfo.bkash;

    useEffect(() => {
        if (!orderId) {
            toast.error('Invalid order session');
            navigate('/');
        }
    }, [orderId, navigate]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.senderNumber.length < 11) return toast.error('Enter a valid phone number');
        if (!form.amountSent) return toast.error('Please enter the amount you sent');

        setLoading(true);
        try {
            await submitPaymentInfoAPI(orderId, form);
            toast.success('Payment information submitted!');
            navigate('/order-success');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page" style={{ background: '#f8f9fa' }}>
            <div className="container" style={{ maxWidth: '500px', paddingTop: '40px' }}>
                <div className="card fade-in" style={{ padding: '32px', textAlign: 'center' }}>
                    <div style={{
                        width: '100%',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}>
                        <img src={info.logo} alt={info.name} style={{ height: '100%', objectFit: 'contain' }} />
                    </div>

                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Pay with {info.name}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Please send money to the merchant number below</p>

                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px dashed ${info.color}`,
                        marginBottom: '24px'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Merchant Number</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{info.number}</span>
                            <button onClick={() => handleCopy(info.number)} style={{ background: 'none', border: 'none', color: info.color, cursor: 'pointer', display: 'flex' }} title="Copy">
                                <FiCopy size={20} />
                            </button>
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '0.9rem', color: info.color, fontWeight: 600 }}>Total Amount: ৳{Number(amount).toLocaleString()}</div>
                    </div>

                    <div style={{ textAlign: 'left', background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px', borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                            <FiInfo style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>1. Go to your {info.name} app or dial USSD<br />2. Select 'Send Money'<br />3. Send <strong>৳{amount}</strong> to <strong>{info.number}</strong><br />4. Enter your details below</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                        <div className="form-group">
                            <label className="form-label">Phone Number *</label>
                            <div style={{ position: 'relative' }}>
                                <FiSmartphone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: '40px' }}
                                    placeholder="Number you sent from"
                                    value={form.senderNumber}
                                    onChange={e => setForm({ ...form, senderNumber: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount Sent (৳) *</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="Amount you sent"
                                value={form.amountSent}
                                onChange={e => setForm({ ...form, amountSent: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Transaction ID (Optional)</label>
                            <input
                                className="form-input"
                                placeholder="e.g. 8N7A6D5C4B"
                                value={form.transactionId}
                                onChange={e => setForm({ ...form, transactionId: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ background: info.color, border: 'none' }}>
                            {loading ? 'Submitting...' : <><FiCheckCircle /> Confirm Payment</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
