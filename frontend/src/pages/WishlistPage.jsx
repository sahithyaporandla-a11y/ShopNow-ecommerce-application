import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice, discountPercent } from '../utils/helpers';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const products = wishlist?.products || [];

  if (products.length === 0) return (
    <div className="page-wrapper">
      <div className="container empty-state">
        <div className="empty-state-icon">❤️</div>
        <h3>Your wishlist is empty</h3>
        <p>Save your favorite items here to buy them later!</p>
        <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>❤️ My Wishlist ({products.length})</h1>

        <div className="products-grid">
          {products.map(product => {
            const price = product.discountPrice > 0 ? product.discountPrice : product.price;
            const discount = discountPercent(product.price, product.discountPrice);
            return (
              <div key={product._id} className="product-card">
                <div className="product-card-img-wrapper">
                  <Link to={`/products/${product._id}`}>
                    <img className="product-card-img" src={product.images?.[0] || 'https://via.placeholder.com/300'} alt={product.name} />
                  </Link>
                  {discount > 0 && (
                    <div className="product-card-badge">
                      <span className="badge badge-success">-{discount}%</span>
                    </div>
                  )}
                </div>
                <div className="product-card-body">
                  <div className="product-card-brand">{product.brand}</div>
                  <Link to={`/products/${product._id}`}>
                    <div className="product-card-name">{product.name}</div>
                  </Link>
                  <div className="product-card-price" style={{ marginBottom: '0.75rem' }}>
                    <span className="price-current">{formatPrice(price)}</span>
                    {discount > 0 && <span className="price-original">{formatPrice(product.price)}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                      id={`wishlist-add-cart-${product._id}`}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => removeFromWishlist(product._id)}
                      id={`wishlist-remove-${product._id}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
