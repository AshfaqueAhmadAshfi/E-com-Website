import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedAPI, getTopRatedAPI, getCategoriesAPI } from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import { FaLaptop, FaTshirt, FaHome, FaBook, FaRunning, FaHeart, FaShoppingBasket, FaGlasses } from 'react-icons/fa';

const catIcons = { 'Electronics': <FaLaptop />, 'Clothing': <FaTshirt />, 'Home & Living': <FaHome />, 'Books': <FaBook />, 'Sports': <FaRunning />, 'Beauty': <FaHeart />, 'Groceries': <FaShoppingBasket />, 'Accessories': <FaGlasses /> };

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getFeaturedAPI(), getTopRatedAPI(), getCategoriesAPI()])
            .then(([f, t, c]) => {
                setFeatured(f.data.products || []);
                setTopRated(t.data.products || []);
                setCategories(c.data.categories || []);
            }).catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            {/* Hero */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="hero-content">
                    <div>
                        <div className="hero-tag"><span className="dot" /> New Collection Available</div>
                        <h1>Discover Your<br /><span className="gradient-text">Perfect Style</span></h1>
                        <p>Shop the latest trends in fashion, electronics, home & living, and more. Premium quality products with fast delivery across Bangladesh.</p>
                        <div className="hero-btns">
                            <Link to="/products" className="btn btn-primary btn-lg">Shop Now <FiArrowRight /></Link>
                            <Link to="/categories" className="btn btn-secondary btn-lg">Explore Categories</Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat"><div className="stat-num">10K+</div><div className="stat-label">Products</div></div>
                            <div className="hero-stat"><div className="stat-num">50K+</div><div className="stat-label">Happy Customers</div></div>
                            <div className="hero-stat"><div className="stat-num">99%</div><div className="stat-label">Satisfaction</div></div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
                                <img src="/logo.png" alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
                                <span style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '800',
                                    background: 'var(--gradient-1)',
                                    WebkitBackgroundClip: 'text',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>X-Look</span>
                            </div>
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Premium Fashion & Lifestyle</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                                <div style={{ flex: 1, padding: '12px', background: 'var(--accent-glow)', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)' }}>৳4,500</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Savings</div>
                                </div>
                                <div style={{ flex: 1, padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>Free</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Shipping 5K+</div>
                                </div>
                            </div>
                        </div>
                        <div className="floating-badge floating-badge-1" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>🔥</span>
                            <div><div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Flash Sale</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Up to 60% OFF</div></div>
                        </div>
                        <div className="floating-badge floating-badge-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⚡</span>
                            <div><div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Fast Delivery</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Within 24hrs</div></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '20px 0', background: 'white', borderBottom: '1px solid #eff0f5' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: <FiTruck />, title: 'Free Shipping', desc: 'Over ৳5,000' },
                        { icon: <FiShield />, title: 'Secure Payment', desc: '100% Locked' },
                        { icon: <FiShoppingBag />, title: 'Easy Returns', desc: '7-day policy' },
                        { icon: <FiHeadphones />, title: '24/7 Support', desc: 'Always here' }
                    ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
                            <div style={{ fontSize: '1.2rem', color: 'var(--accent)', flexShrink: 0 }}>{f.icon}</div>
                            <div><div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{f.title}</div><div style={{ fontSize: '0.75rem', color: '#757575' }}>{f.desc}</div></div>
                        </div>
                    ))}
                </div>
            </section>


            {/* Featured */}
            {featured.length > 0 && (
                <section className="section" style={{ background: '#f5f5f5' }}>
                    <div className="container">
                        <div className="section-header">
                            <h2>Featured Products</h2>
                            <div style={{ height: '2px', width: '40px', background: 'var(--accent)', marginTop: '8px' }} />
                        </div>
                        <div className="products-grid">{featured.map(p => <ProductCard key={p._id} product={p} />)}</div>
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Link to="/products?featured=true" className="btn btn-outline">View All Featured <FiArrowRight /></Link>
                        </div>
                    </div>
                </section>
            )}


            {/* CTA */}
            <section style={{ padding: '40px 0' }}>
                <div className="container">
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)' }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Ready to Start Shopping?</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px', fontSize: '0.9rem' }}>Join thousands of happy customers and discover amazing deals today.</p>
                            <Link to="/register" className="btn btn-primary">Create Account <FiArrowRight /></Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
