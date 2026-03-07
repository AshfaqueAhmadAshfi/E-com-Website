import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesAPI, getAllCategoriesAPI, toggleCategoryAPI } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { FaLaptop, FaTshirt, FaHome, FaBook, FaRunning, FaHeart, FaShoppingBasket, FaGlasses } from 'react-icons/fa';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const icons = { 'Electronics': <FaLaptop />, 'Clothing': <FaTshirt />, 'Home & Living': <FaHome />, 'Books': <FaBook />, 'Sports': <FaRunning />, 'Beauty': <FaHeart />, 'Groceries': <FaShoppingBasket />, 'Accessories': <FaGlasses /> };

const Categories = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(null);

    useEffect(() => {
        const fetchCategories = isAdmin ? getAllCategoriesAPI : getCategoriesAPI;
        fetchCategories()
            .then(r => setCategories(r.data.categories || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isAdmin]);

    const handleToggle = async (e, catId, catName, currentStatus) => {
        e.preventDefault();
        e.stopPropagation();
        setToggling(catId);
        try {
            const res = await toggleCategoryAPI(catId);
            setCategories(prev => prev.map(c => c._id === catId ? { ...c, isActive: res.data.category.isActive } : c));
            toast.success(res.data.category.isActive ? `${catName} is now visible` : `${catName} is now hidden`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to toggle');
        } finally {
            setToggling(null);
        }
    };

    if (loading) return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;

    return (
        <div className="page"><div className="container">
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>All Categories</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Browse products by category
                    {isAdmin && <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--accent)', background: 'rgba(0, 123, 255, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>Admin: Click eye icon to hide/unhide</span>}
                </p>
            </div>
            <div className="categories-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {categories.map(cat => (
                    <Link
                        to={`/products?category=${cat._id}`}
                        key={cat._id}
                        className={`category-card ${!cat.isActive ? 'category-hidden' : ''}`}
                        style={{ padding: '32px', position: 'relative' }}
                    >
                        {/* Hidden badge */}
                        {!cat.isActive && (
                            <span className="category-hidden-badge">Hidden</span>
                        )}

                        {/* Admin toggle button */}
                        {isAdmin && (
                            <button
                                className={`category-toggle-btn ${cat.isActive ? 'active' : 'inactive'}`}
                                onClick={(e) => handleToggle(e, cat._id, cat.name, cat.isActive)}
                                disabled={toggling === cat._id}
                                title={cat.isActive ? 'Hide this category' : 'Show this category'}
                            >
                                {toggling === cat._id ? (
                                    <div className="toggle-spinner" />
                                ) : cat.isActive ? (
                                    <FiEye />
                                ) : (
                                    <FiEyeOff />
                                )}
                            </button>
                        )}

                        <div className="category-icon" style={{ width: '72px', height: '72px', fontSize: '2rem' }}>{icons[cat.name] || '📦'}</div>
                        <div className="category-name" style={{ fontSize: '1.1rem' }}>{cat.name}</div>
                        {cat.description && <div className="category-count" style={{ fontSize: '0.8rem', maxWidth: '200px' }}>{cat.description}</div>}
                    </Link>
                ))}
            </div>
        </div></div>
    );
};

export default Categories;

