import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
    const displayPrice = hasDiscount ? product.discountPrice : product.price;

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FiStar key={i} style={{ fill: i < Math.round(rating) ? '#f59e0b' : 'none', stroke: i < Math.round(rating) ? '#f59e0b' : '#6b6b99' }} />
        ));
    };

    return (
        <div className="card product-card fade-in">
            <Link to={`/product/${product._id}`}>
                <div className="product-img">
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                    ) : (
                        <div className="placeholder-img">📦</div>
                    )}
                    {hasDiscount && <span className="product-badge badge-sale">{discountPercent}% OFF</span>}
                    {product.featured && !hasDiscount && <span className="product-badge badge-hot">🔥 HOT</span>}
                </div>
            </Link>

            <div className="product-actions-overlay">
                <button className="btn-icon" onClick={(e) => { e.preventDefault(); addToCart(product); toast.success('Added to Cart'); }}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'white', color: 'var(--accent)', border: '1px solid #eff0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <FiShoppingCart />
                </button>
                <Link to={`/product/${product._id}`} className="btn-icon"
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,230,0,0.15)' }}>
                    <FiShoppingBag />
                </Link>
            </div>

            <div className="product-info">
                <Link to={`/product/${product._id}`}><h3 className="product-name">{product.name}</h3></Link>
                <div className="product-price">
                    <span className="price-current">৳{displayPrice.toLocaleString()}</span>
                </div>
                {hasDiscount && (
                    <div className="price-discount">
                        <span className="price-original">৳{product.price.toLocaleString()}</span>
                        <span style={{ marginLeft: '4px' }}>-{discountPercent}%</span>
                    </div>
                )}
                <div className="product-rating" style={{ marginTop: '4px' }}>
                    <div className="stars" style={{ fontSize: '0.7rem' }}>{renderStars(product.ratings)}</div>
                    <span className="rating-count" style={{ fontSize: '0.65rem' }}>({product.numReviews})</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
