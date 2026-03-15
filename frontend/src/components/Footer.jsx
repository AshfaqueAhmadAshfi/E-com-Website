import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebookF } from 'react-icons/fa';

const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                <div className="footer-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                        <span style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '800', 
                            background: 'var(--gradient-1)', 
                            WebkitBackgroundClip: 'text', 
                            backgroundClip: 'text', 
                            WebkitTextFillColor: 'transparent'
                        }}>X-Look</span>
                    </div>
                    <p>Your premium online fashion destination. Discover the latest clothing, accessories, and more with fast delivery across Bangladesh.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><FiMapPin /> Dhaka, Bangladesh</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><FiPhone /> +880 1234-567890</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}><FiMail /> support@x-look.com</span>
                    </div>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link to="/" className="footer-link">Home</Link>
                    <Link to="/products" className="footer-link">All Products</Link>
                    <Link to="/categories" className="footer-link">Categories</Link>
                    <Link to="/cart" className="footer-link">Shopping Cart</Link>
                </div>
                <div className="footer-section">
                    <h4>Customer</h4>
                    <Link to="/profile" className="footer-link">My Account</Link>
                    <Link to="/orders" className="footer-link">Order History</Link>
                    <Link to="/login" className="footer-link">Login</Link>
                    <Link to="/register" className="footer-link">Register</Link>
                </div>
                <div className="footer-section">
                    <h4>Support</h4>
                    <Link to="/help-center" className="footer-link">Help Center</Link>
                    <Link to="/shipping-info" className="footer-link">Shipping Info</Link>
                    <Link to="/return-policy" className="footer-link">Return Policy</Link>
                    <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© 2026 X-Look. All rights reserved.</span>
                <div className="footer-socials">
                    <a href="https://www.facebook.com/xlookbd" target="_blank" rel="noopener noreferrer" className="footer-social"><FaFacebookF /></a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
