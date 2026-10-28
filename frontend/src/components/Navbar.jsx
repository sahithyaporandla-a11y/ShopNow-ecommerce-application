import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">ShopNow</Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <span className="search-icon">🔍</span>
          <input
            id="search-input"
            type="text"
            placeholder="Search products, brands…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Nav Actions */}
        <div className="navbar-actions">
          <Link to="/products" className="btn btn-secondary btn-sm" style={{ display: 'none' }}>
            Shop
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn" title="Cart" id="cart-nav-btn">
            🛒
            {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
          </Link>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className="nav-icon-btn" title="Wishlist" id="wishlist-nav-btn">
              ❤️
            </Link>
          )}

          {/* Orders */}
          {user && (
            <Link to="/orders" className="nav-icon-btn" title="My Orders" id="orders-nav-btn">
              📦
            </Link>
          )}

          {/* Admin */}
          {isAdmin && (
            <Link to="/admin" className="btn btn-sm" style={{ background: 'rgba(108,99,255,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(108,99,255,0.3)' }} id="admin-nav-btn">
              ⚡ Admin
            </Link>
          )}

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => setMenuOpen(o => !o)}
              >
                👤 {user.name.split(' ')[0]}
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: '110%', right: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem',
                  minWidth: '160px',
                  zIndex: 1000,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    👤 My Profile
                  </Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    📦 My Orders
                  </Link>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.3rem 0' }} />
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '0.875rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" id="login-nav-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
