import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cart.items || [];
  const subtotal = cart.totalPrice || 0;
  const shipping = subtotal > 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  if (items.length === 0) return (
    <div className="page-wrapper">
      <div className="container empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products and they'll show up here!</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>🛒 My Cart</h1>
          <button className="btn btn-danger btn-sm" onClick={clearCart} id="clear-cart-btn">
            🗑️ Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ gridColumn: '1 / -1', maxWidth: '720px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map(item => (
                <div key={item._id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.product?.name}
                  />
                  <div className="cart-item-info" style={{ flex: 1 }}>
                    <Link to={`/products/${item.product?._id}`} style={{ fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>
                      {item.product?.name}
                    </Link>
                    <div style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>
                      {formatPrice(item.price)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}>−</button>
                        <div className="qty-value">{item.quantity}</div>
                        <button className="qty-btn" onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}>+</button>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item.product?._id)}
                    id={`remove-item-${item.product?._id}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - full width on small, right on large */}
          <div style={{ position: 'sticky', top: '90px', gridColumn: 'span 1' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '1.5rem' }}>Order Summary</h3>

              {[
                ['Subtotal', formatPrice(subtotal)],
                ['Shipping', shipping === 0 ? '🎉 Free' : formatPrice(shipping)],
                ['GST (18%)', formatPrice(tax)]
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <span>{label}</span>
                  <span style={{ color: label === 'Shipping' && shipping === 0 ? 'var(--success)' : '' }}>{value}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                <span>Total</span>
                <span className="text-gradient">{formatPrice(total)}</span>
              </div>

              {shipping > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(34,211,160,0.1)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  Add {formatPrice(999 - subtotal)} more for free shipping!
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/checkout')}
                id="checkout-btn"
              >
                Proceed to Checkout →
              </button>

              <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
