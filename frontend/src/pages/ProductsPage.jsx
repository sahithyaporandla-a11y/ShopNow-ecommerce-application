import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;
  const featured = searchParams.get('featured') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (category) params.set('category', category);
        if (sort) params.set('sort', sort);
        if (featured) params.set('featured', featured);
        params.set('page', page);
        params.set('limit', 12);

        const { data } = await api.get(`/products?${params}`);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, category, sort, page, featured]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const sortOptions = [
    { value: '', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' }
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            {keyword ? `Search: "${keyword}"` : featured ? '⭐ Featured Products' : 'All Products'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {pagination.total} products found
          </p>
        </div>

        <div className="shop-layout">
          {/* ── Sidebar ─────────────────────────────── */}
          <aside className="filter-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>🔧 Filters</h3>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters}>Clear All</button>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <div className="filter-title">Category</div>
              <label className="filter-option">
                <input type="radio" name="cat" checked={!category} onChange={() => updateFilter('category', '')} />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat._id} className="filter-option">
                  <input
                    type="radio"
                    name="cat"
                    checked={category === cat._id}
                    onChange={() => updateFilter('category', cat._id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>

            {/* Featured */}
            <div className="filter-section">
              <div className="filter-title">Product Type</div>
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={featured === 'true'}
                  onChange={e => updateFilter('featured', e.target.checked ? 'true' : '')}
                />
                Featured Only
              </label>
            </div>
          </aside>

          {/* ── Product Grid ─────────────────────────── */}
          <div>
            {/* Sort Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                id="sort-select"
                value={sort}
                onChange={e => updateFilter('sort', e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--bg-elevated)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i}>
                    <div className="skeleton" style={{ aspectRatio: 1, borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ height: '1.3rem', width: '60%' }} />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                    {[...Array(pagination.pages)].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          className={`btn ${page === p ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            next.set('page', p);
                            setSearchParams(next);
                          }}
                          id={`page-btn-${p}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
