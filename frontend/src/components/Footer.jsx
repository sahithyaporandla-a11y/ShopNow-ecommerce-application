export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '3rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem' }}>
              ShopNow
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              Your premium destination for electronics, fashion, home goods, and more. Shop with confidence.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['/', 'Home'], ['/products', 'All Products'], ['/cart', 'Cart'], ['/orders', 'Orders']].map(([href, label]) => (
                <a key={href} href={href} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', transition: 'var(--transition)' }}
                  onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >{label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books'].map(cat => (
                <a key={cat} href={`/products?keyword=${cat}`} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{cat}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Privacy Policy', 'Terms of Service', 'Refund Policy', 'Contact Us'].map(item => (
                <span key={item} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2026 ShopNow. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['💳', '🔒', '📦', '↩️'].map((icon, i) => (
              <span key={i} style={{ fontSize: '1.2rem', opacity: 0.6 }}>{icon}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
