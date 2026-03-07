import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await login(email, password);
            toast.success('Welcome back!');
            if (response.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) { toast.error(err.response?.data?.message || err.message || 'Login failed'); }
        finally { setLoading(false); }
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '60px', objectFit: 'contain', marginBottom: '10px' }} />
                    <span style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        background: 'var(--gradient-1)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>X-Look</span>
                </div>
                <h1 style={{ textAlign: 'center' }}>Welcome Back</h1>
                <p className="auth-subtitle" style={{ textAlign: 'center' }}>Sign in to your X-Look account</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label>
                        <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label"><FiLock style={{ marginRight: '6px' }} />Password</label>
                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ background: 'var(--accent)' }}>{loading ? 'Signing in...' : <><FiLogIn /> Sign In</>}</button>
                </form>

                <div style={{ margin: '24px 0', position: 'relative', textAlign: 'center' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 0 }}></div>
                    <span style={{ position: 'relative', zIndex: 1, background: 'white', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Or continue with</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem' }} onClick={() => toast.success('Google login coming soon!')}>
                        <FaGoogle style={{ color: '#db4437' }} /> Google
                    </button>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem' }} onClick={() => toast.success('Facebook login coming soon!')}>
                        <FaFacebook style={{ color: '#007bff' }} /> Facebook
                    </button>
                </div>
                <div className="auth-divider">
                    <div style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                        Welcome to X-Look Store
                    </div>
                </div>
                <div className="auth-footer">Don't have an account? <Link to="/register">Sign Up</Link></div>
            </div>
        </div>
    );
};

export default Login;
