import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/helpers';

const FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Razorpay & COD' },
  { icon: '↩️', title: 'Easy Returns', desc: '7-day return policy' },
  { icon: '⚡', title: 'Fast Delivery', desc: '2-5 business days' }
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products/categories')
        ]);
        setFeaturedProducts(prodRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle" style={{
              width: `${Math.random() * 10 + 4}px`,
              height: `${Math.random() * 10 + 4}px`,
              left: `${Math.random() * 100}%`,
              background: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
              animationDuration: `${Math.random() * 15 + 10}s`,
              animationDelay: `${Math.random() * 10}s`
            }} />
          ))}
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              ✨ Premium Shopping Experience
            </div>
            <h1>
              Shop Smart,{' '}
              <span className="text-gradient">Live Better</span>
            </h1>
            <p>
              Discover thousands of products across electronics, fashion, home & living, and more — all at unbeatable prices with lightning-fast delivery.
            </p>
            <div className="hero-cta">
              <Link to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
                🛍️ Shop Now
              </Link>
              <Link to="/products?featured=true" className="btn btn-secondary btn-lg">
                ⭐ View Featured
              </Link>
            </div>
            <div className="hero-stats">
              {[['50K+', 'Happy Customers'], ['10K+', 'Products'], ['500+', 'Brands'], ['4.8★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="hero-stat-value">{val}</div>
                  <div className="hero-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ───────────────────────────── */}
      <section style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{f.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Browse our curated collections</p>
              </div>
              <Link to="/products" className="btn btn-secondary btn-sm">View All →</Link>
            </div>
            <div className="categories-grid">
              {categories.map(cat => (
                <Link key={cat._id} to={`/products?category=${cat._id}`}>
                  <div className="category-card">
                    <img src={cat.image || 'https://via.placeholder.com/300'} alt={cat.name} />
                    <div className="category-card-overlay">
                      <div className="category-card-name">{cat.name}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">⭐ Featured Products</h2>
              <p className="section-subtitle">Hand-picked bestsellers for you</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All →</Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: 1, marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }} />
                  <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ height: '1.5rem', width: '60%', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Banner ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'20\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', opacity: 0.3 }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white', marginBottom: '1rem', position: 'relative' }}>
              🎉 Special Offer!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2rem', position: 'relative' }}>
              Get free shipping on your first order + extra 10% off with code <strong>SHOPNOW10</strong>
            </p>
            <Link to="/products" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, position: 'relative' }} id="banner-cta-btn">
              Claim Offer 🎁
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
