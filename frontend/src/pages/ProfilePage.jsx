import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', {
        name: form.name,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode }
      });
      updateUser(data.user);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed! 🔐');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '760px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>👤 My Profile</h1>

        {/* Avatar & Info */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: 'white', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
            <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`} style={{ marginTop: '0.5rem' }}>
              {user?.role === 'admin' ? '⚡ Admin' : '👤 Customer'}
            </span>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>✏️ Edit Profile</h3>
          <form onSubmit={handleProfileSave} className="form-grid">
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label htmlFor="profile-name">Full Name</label>
                <input id="profile-name" className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your Name" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-phone">Phone</label>
                <input id="profile-phone" className="input" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" />
              </div>
            </div>

            <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>📍 Address</h4>

            <div className="input-group">
              <label htmlFor="profile-street">Street Address</label>
              <input id="profile-street" className="input" value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} placeholder="123 MG Road" />
            </div>
            <div className="form-grid form-grid-2">
              <div className="input-group">
                <label htmlFor="profile-city">City</label>
                <input id="profile-city" className="input" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Bangalore" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-state">State</label>
                <input id="profile-state" className="input" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} placeholder="Karnataka" />
              </div>
            </div>
            <div className="input-group" style={{ maxWidth: '200px' }}>
              <label htmlFor="profile-pincode">Pincode</label>
              <input id="profile-pincode" className="input" value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))} placeholder="560001" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
              {saving ? '⏳ Saving...' : '✅ Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>🔐 Change Password</h3>
          <form onSubmit={handlePwSave} className="form-grid">
            <div className="input-group">
              <label htmlFor="current-pw">Current Password</label>
              <input
                id="current-pw"
                type="password"
                className="input"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="new-pw">New Password</label>
              <input
                id="new-pw"
                type="password"
                className="input"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-outline" style={{ width: 'fit-content' }} disabled={savingPw} id="save-password-btn">
              {savingPw ? '⏳ Changing...' : '🔐 Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
