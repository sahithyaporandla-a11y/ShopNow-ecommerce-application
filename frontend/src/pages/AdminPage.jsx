import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Stat Cards ──────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}20` }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      </div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

// ── Products Tab ────────────────────────────────────────
function ProductsTab({ categories }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discountPrice: '', category: '',
    brand: '', stock: '', images: '', tags: '', featured: false
  });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data.products);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: '', description: '', price: '', discountPrice: '', category: '', brand: '', stock: '', images: '', tags: '', featured: false });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice,
      category: p.category?._id || '', brand: p.brand || '', stock: p.stock,
      images: p.images?.join(', ') || '', tags: p.tags?.join(', ') || '', featured: p.featured
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: Number(form.discountPrice) || 0,
      stock: Number(form.stock),
      images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean)
    };
    try {
      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Products ({products.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={openCreate} id="create-product-btn">+ Add Product</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editingProduct ? 'Edit Product' : 'New Product'}</h4>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label>Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div className="input-group">
                <label>Brand</label>
                <input className="input" value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} />
              </div>
            </div>
            <div className="input-group">
              <label>Description *</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required />
            </div>
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label>Price (₹) *</label>
                <input type="number" className="input" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required min="0" />
              </div>
              <div className="input-group">
                <label>Discount Price (₹)</label>
                <input type="number" className="input" value={form.discountPrice} onChange={e => setForm(f => ({...f, discountPrice: e.target.value}))} min="0" />
              </div>
            </div>
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label>Category *</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} required style={{ cursor: 'pointer' }}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Stock *</label>
                <input type="number" className="input" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} required min="0" />
              </div>
            </div>
            <div className="input-group">
              <label>Image URLs (comma-separated)</label>
              <input className="input" value={form.images} onChange={e => setForm(f => ({...f, images: e.target.value}))} placeholder="https://..., https://..." />
            </div>
            <div className="input-group">
              <label>Tags (comma-separated)</label>
              <input className="input" value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="electronics, smartphone, ..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} style={{ accentColor: 'var(--primary)' }} />
              Featured Product
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" id="save-product-btn">{editingProduct ? 'Update' : 'Create'} Product</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={p.images?.[0] || 'https://via.placeholder.com/40'} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category?.name}</td>
                <td>{formatPrice(p.discountPrice > 0 ? p.discountPrice : p.price)}</td>
                <td>
                  <span style={{ color: p.stock === 0 ? 'var(--error)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)' }}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)} id={`edit-product-${p._id}`}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)} id={`delete-product-${p._id}`}>Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Orders Tab ──────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/admin/orders${filterStatus ? `?status=${filterStatus}` : ''}`);
      setOrders(data.orders);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { orderStatus: status });
      toast.success('Order status updated!');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  <Link to={`/orders/${order._id}`} style={{ color: 'var(--primary-light)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{order.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                </td>
                <td style={{ fontSize: '0.8rem' }}>{formatDate(order.createdAt)}</td>
                <td style={{ fontWeight: 700 }}>{formatPrice(order.totalPrice)}</td>
                <td>
                  <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusClass(order.orderStatus)}`} style={{ textTransform: 'capitalize' }}>
                    {order.orderStatus}
                  </span>
                </td>
                <td>
                  {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                    <select
                      className="input"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}
                      value={order.orderStatus}
                      onChange={e => updateStatus(order._id, e.target.value)}
                      id={`status-select-${order._id}`}
                    >
                      {['pending','processing','shipped','delivered'].map(s => (
                        <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</div>}
      </div>
    </div>
  );
}

// ── Users Tab ───────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId, currentActive) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}`, { isActive: !currentActive });
      setUsers(u => u.map(usr => usr._id === userId ? data.user : usr));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{u.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.email}</div>
              </td>
              <td>
                <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{u.role}</span>
              </td>
              <td style={{ fontSize: '0.8rem' }}>{formatDate(u.createdAt)}</td>
              <td>
                <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {u.isActive ? 'Active' : 'Blocked'}
                </span>
              </td>
              <td>
                {u.role !== 'admin' && (
                  <button
                    className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => toggleStatus(u._id, u.isActive)}
                    id={`toggle-user-${u._id}`}
                  >
                    {u.isActive ? 'Block' : 'Unblock'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Categories Tab ──────────────────────────────────────
function CategoriesTab({ categories, onRefresh }) {
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editingCat, setEditingCat] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await api.put(`/admin/categories/${editingCat._id}`, form);
        toast.success('Category updated!');
      } else {
        await api.post('/admin/categories', form);
        toast.success('Category created!');
      }
      setShowForm(false);
      setForm({ name: '', description: '', image: '' });
      setEditingCat(null);
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      onRefresh();
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Categories ({categories.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingCat(null); setForm({ name: '', description: '', image: '' }); setShowForm(true); }} id="create-category-btn">+ Add Category</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="input-group"><label>Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
              <div className="input-group"><label>Image URL</label><input className="input" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} /></div>
            </div>
            <div className="input-group"><label>Description</label><input className="input" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm">{editingCat ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {categories.map(cat => (
          <div key={cat._id} className="card" style={{ padding: '1.25rem' }}>
            {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }} />}
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{cat.name}</div>
            {cat.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{cat.description}</div>}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditingCat(cat); setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' }); setShowForm(true); }}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)} id={`delete-cat-${cat._id}`}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────
export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchStats = async () => {
    try {
      const [statsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/categories')
      ]);
      setStats(statsRes.data);
      setCategories(catRes.data.categories);
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products',  label: '📦 Products' },
    { id: 'orders',    label: '🛒 Orders' },
    { id: 'users',     label: '👥 Users' },
    { id: 'categories', label: '🏷️ Categories' }
  ];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>⚡ Admin Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your e-commerce platform</p>
          </div>
          <Link to="/" className="btn btn-secondary btn-sm">← View Store</Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', padding: '0.25rem 0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.id)}
              id={`admin-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard icon="💰" value={formatPrice(stats.stats.totalRevenue)} label="Total Revenue" color="var(--success)" />
              <StatCard icon="🛒" value={stats.stats.totalOrders} label="Total Orders" color="var(--primary)" />
              <StatCard icon="📦" value={stats.stats.totalProducts} label="Products" color="var(--info)" />
              <StatCard icon="👥" value={stats.stats.totalUsers} label="Customers" color="var(--secondary)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Recent Orders */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem' }}>🕒 Recent Orders</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.recentOrders?.map(order => (
                    <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--primary-light)' }}>#{order._id.slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatPrice(order.totalPrice)}</div>
                        <span className={`badge ${getStatusClass(order.orderStatus)}`} style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>{order.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1rem' }}>📊 Order Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`badge ${getStatusClass(status)}`} style={{ textTransform: 'capitalize' }}>{status}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '100px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--gradient-primary)', width: `${(count / stats.stats.totalOrders) * 100}%`, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductsTab categories={categories} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'categories' && <CategoriesTab categories={categories} onRefresh={fetchStats} />}
      </div>
    </div>
  );
}
