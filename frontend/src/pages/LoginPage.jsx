import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (mode === 'register' && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let result;
    if (mode === 'login') {
      result = await login(form.email, form.password);
    } else {
      result = await register(form.name, form.email, form.password, form.phone);
    }

    if (result?.success) {
      // If admin, go to admin panel
      if (result.user?.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block', marginBottom: '0.5rem' }}>
            ShopNow
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {mode === 'login' ? 'Welcome back! 👋' : 'Create an account 🚀'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Sign in to continue shopping' : 'Join thousands of happy shoppers'}
          </p>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem', width: '100%' }}>
          <button className={`tab ${mode === 'login' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => { setMode('login'); setErrors({}); }} id="login-tab">
            Sign In
          </button>
          <button className={`tab ${mode === 'register' ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => { setMode('register'); setErrors({}); }} id="register-tab">
            Sign Up
          </button>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Name (register only) */}
            {mode === 'register' && (
              <div className="input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                />
                {errors.name && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.name}</span>}
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.email}</span>}
            </div>

            {/* Phone (register only) */}
            {mode === 'register' && (
              <div className="input-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" type="tel" className="input" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>
            )}

            {/* Password */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              id={mode === 'login' ? 'login-submit-btn' : 'register-submit-btn'}
            >
              {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Demo Credentials</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            👤 User: <strong>john@example.com</strong> / <strong>user123</strong>
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            ⚡ Admin: <strong>admin@shopnow.com</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
