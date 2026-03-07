import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { updateProfileAPI, updatePasswordAPI } from '../utils/api.js';
import toast from 'react-hot-toast';
import { FiUser, FiSettings, FiLock, FiLogOut } from 'react-icons/fi';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('profile');
    const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', street: user?.address?.street || '', city: user?.address?.city || '', state: user?.address?.state || '', zipCode: user?.address?.zipCode || '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    if (!user) { navigate('/login'); return null; }

    const handleProfile = async (e) => {
        e.preventDefault();
        if (profile.phone && profile.phone.length !== 11) {
            return toast.error('Phone number must be exactly 11 digits');
        }
        setLoading(true);
        try {
            const { data } = await updateProfileAPI({ name: profile.name, phone: profile.phone, address: { street: profile.street, city: profile.city, state: profile.state, zipCode: profile.zipCode } });
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (err) { toast.error('Error updating profile'); }
        finally { setLoading(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            await updatePasswordAPI({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            toast.success('Password updated!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page"><div className="container">
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>My Account</h1>
            <div className="profile-layout">
                <div className="profile-sidebar">
                    <div className="profile-avatar">{user.name?.charAt(0)}</div>
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-email">{user.email}</div>
                    <div style={{ margin: '16px 0', padding: '8px 16px', background: user.role === 'admin' ? 'rgba(139,92,246,0.15)' : 'rgba(16,185,129,0.15)', borderRadius: '50px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: user.role === 'admin' ? 'var(--accent-light)' : 'var(--success)', textTransform: 'capitalize' }}>{user.role}</div>
                    <div className="profile-nav">
                        <div className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FiUser /> Personal Info</div>
                        <div className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}><FiLock /> Change Password</div>
                        <div className="profile-nav-item" style={{ color: 'var(--danger)' }} onClick={logout}><FiLogOut /> Logout</div>
                    </div>
                </div>

                <div>
                    {tab === 'profile' && (
                        <div className="card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px' }}>Personal Information</h2>
                            <form onSubmit={handleProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profile.phone} onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 11) setProfile(p => ({ ...p, phone: val }));
                                    }} placeholder="01XXXXXXXXX" /></div>
                                </div>
                                <div className="form-group"><label className="form-label">Street Address</label><input className="form-input" value={profile.street} onChange={e => setProfile(p => ({ ...p, street: e.target.value }))} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="form-group"><label className="form-label">City</label><input className="form-input" value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">State</label><input className="form-input" value={profile.state} onChange={e => setProfile(p => ({ ...p, state: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-input" value={profile.zipCode} onChange={e => setProfile(p => ({ ...p, zipCode: e.target.value }))} /></div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                            </form>
                        </div>
                    )}
                    {tab === 'password' && (
                        <div className="card" style={{ padding: '32px' }}>
                            <h2 style={{ marginBottom: '24px' }}>Change Password</h2>
                            <form onSubmit={handlePassword} style={{ maxWidth: '400px' }}>
                                <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-input" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} required /></div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div></div>
    );
};

export default Profile;
