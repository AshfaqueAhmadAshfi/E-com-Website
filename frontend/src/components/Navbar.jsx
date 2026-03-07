import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogOut, FiSettings, FiPackage, FiGrid, FiSearch } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { totalItems } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${searchTerm.trim()}`);
        }
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location]);

    const isActive = (path) => location.pathname === path;

    // Don't show navbar on admin pages
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-inner">
                <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'var(--gradient-1)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px'
                    }}>X-Look</span>
                </Link>

                <form className="nav-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search in X-Look"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit"><FiSearch /></button>
                </form>

                <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
                    <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Products</Link>
                    <Link to="/categories" className={`nav-link ${isActive('/categories') ? 'active' : ''}`}>Categories</Link>
                </div>

                <div className="nav-actions">
                    <Link to="/cart" className="nav-icon-btn">
                        <FiShoppingCart />
                        {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
                    </Link>

                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button className="nav-user" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <div className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                                {user.name?.split(' ')[0]}
                            </button>
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: '110%', right: 0, background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                    minWidth: '200px', padding: '8px', boxShadow: 'var(--shadow-lg)', zIndex: 100,
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.target.style.background = 'var(--accent-glow)'; e.target.style.color = 'var(--text-primary)'; }}
                                        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}>
                                        <FiUser /> Profile
                                    </Link>
                                    <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.target.style.background = 'var(--accent-glow)'; e.target.style.color = 'var(--text-primary)'; }}
                                        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-secondary)'; }}>
                                        <FiPackage /> Orders
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: 'var(--accent-light)', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                            onMouseEnter={e => { e.target.style.background = 'var(--accent-glow)'; }}
                                            onMouseLeave={e => { e.target.style.background = 'transparent'; }}>
                                            <FiGrid /> Admin Panel
                                        </Link>
                                    )}
                                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.9rem', width: '100%', background: 'none', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.1)'}
                                        onMouseLeave={e => e.target.style.background = 'transparent'}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                    )}

                    <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
