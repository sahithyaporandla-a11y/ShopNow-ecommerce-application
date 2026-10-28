import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, discountPercent, renderStars, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product._id, qty);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setReviewComment('');
      // Reload product to show review
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
          <div>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: i === 1 ? '2rem' : '1rem', marginBottom: '1rem', width: i === 0 ? '30%' : i === 2 ? '60%' : '100%' }} />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="page-wrapper empty-state">
      <div className="empty-state-icon">😔</div>
      <h3>Product not found</h3>
      <Link to="/products" className="btn btn-primary">Browse Products</Link>
    </div>
  );

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = discountPercent(product.price, product.discountPrice);
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/products">Products</Link>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
          {/* Images */}
          <div>
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: '1rem',
              aspectRatio: '1',
              border: '1px solid var(--border)'
            }}>
              <img
                src={product.images?.[selectedImg] || 'https://via.placeholder.com/500'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    style={{
                      width: '70px', height: '70px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: `2px solid ${selectedImg === i ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', background: 'rgba(108,99,255,0.15)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, marginBottom: '0.75rem' }}>
              {product.category?.name || 'General'}
            </div>

            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--warning)', fontSize: '1.1rem' }}>{renderStars(product.rating)}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {product.rating?.toFixed(1)} ({product.numReviews} reviews)
              </span>
              {product.brand && (
                <>
                  <span style={{ color: 'var(--border)' }}>|</span>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>{product.brand}</span>
                </>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900 }}>{formatPrice(price)}</span>
              {discount > 0 && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatPrice(product.price)}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem' }}>-{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.75rem', fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: product.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                {product.stock > 0 ? `✅ In Stock (${product.stock} left)` : '❌ Out of Stock'}
              </span>
            </div>

            {/* Qty & Actions */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <div className="qty-value">{qty}</div>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  style={{ flex: 1 }}
                  id="add-to-cart-detail-btn"
                >
                  🛒 Add to Cart
                </button>
                <button
                  className="btn btn-secondary btn-icon"
                  style={{ width: '3rem', height: '3rem', background: wishlisted ? 'rgba(255,77,109,0.2)' : '' }}
                  onClick={() => toggleWishlist(product._id)}
                  id="wishlist-detail-btn"
                >
                  {wishlisted ? '❤️' : '🤍'}
                </button>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.tags.map(tag => (
                  <span key={tag} className="badge badge-primary">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>
            💬 Customer Reviews ({product.numReviews})
          </h2>

          {/* Add Review Form */}
          {user && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Write a Review</h3>
              <form onSubmit={handleReview}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Your Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1,2,3,4,5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: star <= reviewRating ? 'var(--warning)' : 'var(--border)' }}
                      >★</button>
                    ))}
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <textarea
                    className="input"
                    placeholder="Share your experience with this product..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview} id="submit-review-btn">
                  {submittingReview ? '⏳ Submitting...' : '📝 Submit Review'}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {product.reviews?.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <div className="empty-state-icon">💬</div>
              <h3>No reviews yet</h3>
              <p>Be the first to review this product!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.reviews?.map(review => (
                <div key={review._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{review.name}</span>
                      <span style={{ color: 'var(--warning)', marginLeft: '0.75rem' }}>{renderStars(review.rating)}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(review.createdAt)}</span>
                  </div>
                  {review.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
