import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductAPI, addReviewAPI, updateReviewAPI, deleteReviewAPI } from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FiStar, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiCheck, FiMinus, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    useEffect(() => {
        setLoading(true);
        getProductAPI(id).then(r => {
            setProduct(r.data.product);
            if (r.data.product?.sizes?.length > 0) setSelectedSize(r.data.product.sizes[0]);
            if (r.data.product?.colors?.length > 0) setSelectedColor(r.data.product.colors[0]);
        }).catch(() => toast.error('Product not found')).finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
        if (product.colors?.length > 0 && !selectedColor) return toast.error('Please select a color');
        addToCart(product, qty, selectedSize, selectedColor);
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (!user) {
            toast.error('Please login to buy products');
            return navigate(`/register?redirect=/product/${id}`);
        }
        if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size');
        if (product.colors?.length > 0 && !selectedColor) return toast.error('Please select a color');
        addToCart(product, qty, selectedSize, selectedColor);
        navigate('/checkout');
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) return toast.error('Please login to review');
        setSubmitting(true);
        try {
            if (editingReview) {
                await updateReviewAPI(id, editingReview, reviewForm);
                toast.success('Review updated!');
            } else {
                await addReviewAPI(id, reviewForm);
                toast.success('Review added!');
            }
            const r = await getProductAPI(id);
            setProduct(r.data.product);
            setReviewForm({ rating: 5, comment: '' });
            setEditingReview(null);
        } catch (err) { toast.error(err.response?.data?.message || 'Error saving review'); }
        finally { setSubmitting(false); }
    };

    const handleEditReview = (review) => {
        setEditingReview(review._id);
        setReviewForm({ rating: review.rating, comment: review.comment });
        window.scrollTo({ top: document.querySelector('.reviews-section').offsetTop - 100, behavior: 'smooth' });
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Delete this review?')) return;
        try {
            await deleteReviewAPI(id, reviewId);
            toast.success('Review deleted');
            const r = await getProductAPI(id);
            setProduct(r.data.product);
        } catch (err) { toast.error('Error deleting review'); }
    };

    if (loading) return <div className="page"><div className="loading-page"><div className="spinner" /></div></div>;
    if (!product) return <div className="page"><div className="container"><div className="empty-state"><h3>Product not found</h3><Link to="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>Browse Products</Link></div></div></div>;

    const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
    const displayPrice = hasDiscount ? product.discountPrice : product.price;
    const hasSizes = product.sizes?.length > 0;
    const hasColors = product.colors?.length > 0;

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link> / <Link to="/products" style={{ color: 'var(--text-muted)' }}>Products</Link> / <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                </div>

                <div className="product-detail fade-in">
                    <div className="product-gallery">
                        <div className="gallery-main">
                            {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div style={{ fontSize: '5rem' }}>📦</div>}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="gallery-thumbs">
                                {product.images.map((img, i) => (<div key={i} className="gallery-thumb"><img src={img} alt="" /></div>))}
                            </div>
                        )}
                    </div>

                    <div className="detail-info">
                        <div className="product-category" style={{ marginBottom: '8px' }}>{product.category?.name}</div>
                        <h1>{product.name}</h1>
                        <div className="detail-meta">
                            <div className="product-rating">
                                <div className="stars">{[...Array(5)].map((_, i) => <FiStar key={i} style={{ fill: i < Math.round(product.ratings) ? '#f59e0b' : 'none', stroke: i < Math.round(product.ratings) ? '#f59e0b' : '#6b6b99' }} />)}</div>
                                <span className="rating-count">{product.ratings?.toFixed(1)} ({product.numReviews} reviews)</span>
                            </div>
                            {product.stock > 0 ? <span className="tag tag-green"><FiCheck /> In Stock ({product.stock})</span> : <span className="tag tag-red">Out of Stock</span>}
                        </div>

                        <div className="detail-price">
                            <span className="price-current">৳{displayPrice.toLocaleString()}</span>
                            {hasDiscount && <span className="price-original" style={{ marginLeft: '12px' }}>৳{product.price.toLocaleString()}</span>}
                            {hasDiscount && <span className="price-discount" style={{ marginLeft: '8px' }}>Save {Math.round((1 - product.discountPrice / product.price) * 100)}%</span>}
                        </div>

                        <p className="detail-description">{product.description}</p>

                        {/* Color Selector */}
                        {hasColors && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    Select Color: <span style={{ color: 'var(--accent-light)', marginLeft: '4px' }}>{selectedColor}</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                border: selectedColor === color ? '2.5px solid #fff' : '1px solid var(--border)',
                                                background: color.toLowerCase(),
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: selectedColor === color ? '0 0 0 2px var(--accent), 0 4px 10px rgba(0,0,0,0.3)' : 'none',
                                                transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={color}
                                        >
                                            {selectedColor === color && <FiCheck style={{ color: (color.toLowerCase() === 'white' || color.toLowerCase() === 'yellow') ? '#000' : '#fff', fontSize: '1rem' }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {hasSizes && (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-primary)' }}>
                                    Select Size: <span style={{ color: 'var(--accent-light)', marginLeft: '4px' }}>{selectedSize}</span>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                    {product.sizes.map(size => (
                                        <div key={size} style={{ position: 'relative' }}>
                                            <button
                                                onClick={() => setSelectedSize(size)}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '12px',
                                                    border: selectedSize === size ? '1px solid var(--accent)' : '1px solid var(--border)',
                                                    background: selectedSize === size ? 'var(--bg-card-hover)' : 'var(--bg-secondary)',
                                                    color: selectedSize === size ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    boxShadow: selectedSize === size ? '0 8px 20px rgba(0, 123, 255, 0.15)' : 'none',
                                                    minWidth: '60px',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {size}
                                                {selectedSize === size && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '8px', marginLeft: '4px' }}>
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
                                                            style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-light)', cursor: 'pointer', padding: '4px' }}
                                                            title="Add to Cart"
                                                        >
                                                            Add
                                                        </span>
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 800,
                                                                background: 'var(--gradient-1)',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                color: '#fff',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)'
                                                            }}
                                                            title="Buy Now"
                                                        >
                                                            Buy
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.stock > 0 && (
                            <div className="detail-actions">
                                <div className="quantity-selector">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))}><FiPlus /></button>
                                </div>
                                <button className="btn btn-secondary btn-lg" onClick={handleAddToCart} style={{ flex: 1, padding: '14px' }}>
                                    <FiShoppingCart /> Add to Cart
                                </button>
                                <button className="btn btn-primary btn-lg" onClick={handleBuyNow} style={{ flex: 1, padding: '14px', background: 'var(--accent)' }}>
                                    Buy Now
                                </button>
                            </div>
                        )}

                        <div className="detail-features">
                            <div className="feature-item"><FiTruck className="icon" /> Free Shipping over ৳5,000</div>
                            <div className="feature-item"><FiShield className="icon" /> Genuine Product</div>
                            <div className="feature-item"><FiRefreshCw className="icon" /> 7-Day Returns</div>
                            <div className="feature-item"><FiCheck className="icon" /> Secure Payment</div>
                        </div>

                        {product.brand && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Brand: <strong style={{ color: 'var(--text-primary)' }}>{product.brand}</strong></div>}
                    </div>
                </div>

                {/* Reviews */}
                <div className="reviews-section">
                    <h2 style={{ marginBottom: '24px' }}>Customer Reviews ({product.numReviews})</h2>

                    {user && (
                        <form onSubmit={handleReview} style={{ marginBottom: '32px', background: 'var(--bg-card)', border: editingReview ? '1px solid var(--accent)' : '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>{editingReview ? 'Update Your Review' : 'Write a Review'}</h3>
                            <div className="form-group">
                                <label className="form-label">Rating</label>
                                <select className="form-input form-select" value={reviewForm.rating} onChange={e => setReviewForm(f => ({ ...f, rating: e.target.value }))} style={{ width: '120px' }}>
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Comment</label>
                                <textarea className="form-input" value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Share your experience..." required />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : (editingReview ? 'Update Review' : 'Submit Review')}</button>
                                {editingReview && <button type="button" className="btn btn-secondary" onClick={() => { setEditingReview(null); setReviewForm({ rating: 5, comment: '' }); }}>Cancel</button>}
                            </div>
                        </form>
                    )}

                    {product.reviews?.length > 0 ? product.reviews.map((r, i) => (
                        <div key={i} className="review-card">
                            <div className="review-header">
                                <div className="review-avatar">{r.name?.charAt(0)}</div>
                                <div>
                                    <div className="review-name">{r.name}</div>
                                    <div className="stars" style={{ fontSize: '0.7rem' }}>{[...Array(5)].map((_, j) => <FiStar key={j} style={{ fill: j < r.rating ? '#f59e0b' : 'none', stroke: j < r.rating ? '#f59e0b' : '#6b6b99' }} />)}</div>
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="review-date" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                                    {(user && (user._id === r.user?._id || user._id === r.user || user.role === 'admin')) && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditReview(r)} style={{ background: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1rem', display: 'flex' }} title="Edit"><FiEdit /></button>
                                            <button onClick={() => handleDeleteReview(r._id)} style={{ background: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem', display: 'flex' }} title="Delete"><FiTrash2 /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.comment}</p>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No reviews yet. Be the first to review!</p>}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
