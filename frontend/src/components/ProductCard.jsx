import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice, discountPercent, renderStars } from '../utils/helpers';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discount = discountPercent(product.price, product.discountPrice);
  const wishlisted = isWishlisted(product._id);

  return (
    <div className="product-card">
      <div className="product-card-img-wrapper">
        <Link to={`/products/${product._id}`}>
          <img
            className="product-card-img"
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {discount > 0 && (
          <div className="product-card-badge">
            <span className="badge badge-success">-{discount}%</span>
          </div>
        )}

        <div className="product-card-actions">
          <button
            className="btn btn-secondary btn-icon"
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            onClick={() => toggleWishlist(product._id)}
            style={{ background: wishlisted ? 'rgba(255,77,109,0.2)' : 'var(--bg-card)' }}
            id={`wishlist-btn-${product._id}`}
          >
            {wishlisted ? '❤️' : '🤍'}
          </button>
          <button
            className="btn btn-secondary btn-icon"
            title="Quick View"
            onClick={() => window.location.href = `/products/${product._id}`}
          >
            👁️
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-brand">{product.brand || 'Generic'}</div>
        <Link to={`/products/${product._id}`}>
          <div className="product-card-name">{product.name}</div>
        </Link>

        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="stars" style={{ fontSize: '0.75rem' }}>{renderStars(product.rating)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({product.numReviews})</span>
          </div>
        )}

        <div className="product-card-price">
          <span className="price-current">{formatPrice(price)}</span>
          {discount > 0 && (
            <span className="price-original">{formatPrice(product.price)}</span>
          )}
        </div>

        {product.stock === 0 ? (
          <button className="btn btn-secondary btn-sm" disabled style={{ width: '100%', marginTop: '0.75rem' }}>
            Out of Stock
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => addToCart(product._id, 1)}
            id={`add-cart-${product._id}`}
          >
            🛒 Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
