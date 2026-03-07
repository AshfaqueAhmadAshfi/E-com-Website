import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Account created!');
            navigate('/');
        } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
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
                <h1 style={{ textAlign: 'center' }}>Create Account</h1>
                <p className="auth-subtitle" style={{ textAlign: 'center' }}>Join X-Look and start shopping</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group"><label className="form-label"><FiUser style={{ marginRight: '6px' }} />Full Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required /></div>
                    <div className="form-group"><label className="form-label"><FiMail style={{ marginRight: '6px' }} />Email</label><input type="email" className="form-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" required /></div>
                    <div className="form-group"><label className="form-label"><FiLock style={{ marginRight: '6px' }} />Password</label><input type="password" className="form-input" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required /></div>
                    <div className="form-group"><label className="form-label"><FiLock style={{ marginRight: '6px' }} />Confirm Password</label><input type="password" className="form-input" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Confirm password" required /></div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ background: 'var(--accent)' }}>{loading ? 'Creating...' : <><FiUserPlus /> Create Account</>}</button>
                </form>

                <div style={{ margin: '24px 0', position: 'relative', textAlign: 'center' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border)', zIndex: 0 }}></div>
                    <span style={{ position: 'relative', zIndex: 1, background: 'white', padding: '0 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Or continue with</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem' }} onClick={() => toast.success('Google registration coming soon!')}>
                        <FaGoogle style={{ color: '#db4437' }} /> Google
                    </button>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', fontSize: '0.9rem' }} onClick={() => toast.success('Facebook registration coming soon!')}>
                        <FaFacebook style={{ color: '#007bff' }} /> Facebook
                    </button>
                </div>
                <div className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></div>
            </div>
        </div>
    );
};

export default Register;
