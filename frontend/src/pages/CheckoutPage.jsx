import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPrice } from '../utils/helpers';
import { useRazorpay } from '../hooks/useRazorpay';
import toast from 'react-hot-toast';

// ── Payment method config ─────────────────────────────────
const PAYMENT_METHODS = [
  {
    value: 'cod',
    icon: '💵',
    label: 'Cash on Delivery',
    desc: 'Pay when your order arrives at your door',
    badges: ['Safe', 'No extra charge']
  },
  {
    value: 'razorpay',
    icon: '⚡',
    label: 'Pay Online — Razorpay',
    desc: 'UPI · Credit/Debit Card · Net Banking · Wallet',
    badges: ['Instant', 'Secure', '100+ options']
  }
];

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pay } = useRazorpay();

  const [form, setForm] = useState({
    street:  user?.address?.street  || '',
    city:    user?.address?.city    || '',
    state:   user?.address?.state   || '',
    pincode: user?.address?.pincode || '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  // Price calculations
  const subtotal = cart.totalPrice || 0;
  const shipping  = subtotal > 999 ? 0 : 49;
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + shipping + tax;

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    const missing = ['street', 'city', 'state', 'pincode'].filter(k => !form[k]?.trim());
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  // ── COD flow ──────────────────────────────────────────────
  const placeCODOrder = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: form,
        paymentMethod: 'cod'
      });
      await clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // ── Razorpay flow ─────────────────────────────────────────
  const placeRazorpayOrder = () => {
    setLoading(true);
    pay({
      total,
      shippingAddress: form,
      user,
      onSuccess: async (orderId) => {
        await clearCart();
        setLoading(false);
        navigate(`/orders/${orderId}`);
      },
      onFailure: (orderId) => {
        setLoading(false);
        // Navigate to the unpaid order so user can see it
        navigate(`/orders/${orderId}`);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAddress()) return;
    if (paymentMethod === 'cod') placeCODOrder();
    else placeRazorpayOrder();
  };

  if (!cart.items?.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>🏁 Checkout</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {cart.items?.length} item{cart.items?.length !== 1 ? 's' : ''} · {formatPrice(total)} total
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>

            {/* ── Left column ───────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Shipping Address */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--gradient-primary)', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>1</span>
                  Shipping Address
                </h3>
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="street">Street Address *</label>
                    <input
                      id="street" name="street" className="input"
                      value={form.street} onChange={handleChange}
                      placeholder="123 MG Road, Apartment 4B" required
                    />
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="input-group">
                      <label htmlFor="city">City *</label>
                      <input id="city" name="city" className="input" value={form.city} onChange={handleChange} placeholder="Bangalore" required />
                    </div>
                    <div className="input-group">
                      <label htmlFor="state">State *</label>
                      <input id="state" name="state" className="input" value={form.state} onChange={handleChange} placeholder="Karnataka" required />
                    </div>
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="input-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input id="pincode" name="pincode" className="input" value={form.pincode} onChange={handleChange} placeholder="560001" required maxLength={6} />
                    </div>
                    <div className="input-group">
                      <label htmlFor="country">Country</label>
                      <input id="country" name="country" className="input" value={form.country} disabled style={{ opacity: 0.6 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--gradient-primary)', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>2</span>
                  Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {PAYMENT_METHODS.map(opt => (
                    <label
                      key={opt.value}
                      htmlFor={`pay-${opt.value}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '1.15rem',
                        background: paymentMethod === opt.value
                          ? 'rgba(108,99,255,0.08)'
                          : 'var(--bg-elevated)',
                        border: `2px solid ${paymentMethod === opt.value ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <input
                        type="radio"
                        id={`pay-${opt.value}`}
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={e => setPaymentMethod(e.target.value)}
                        style={{ accentColor: 'var(--primary)', marginTop: '3px', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                          <span style={{ marginRight: '0.4rem' }}>{opt.icon}</span>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          {opt.desc}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {opt.badges.map(b => (
                            <span key={b} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', borderRadius: '99px', fontWeight: 600 }}>{b}</span>
                          ))}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Razorpay brand logos */}
                {paymentMethod === 'razorpay' && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accepted:</span>
                    {['Visa', 'MasterCard', 'UPI', 'Paytm', 'PhonePe', 'GPay', 'NetBanking'].map(p => (
                      <span key={p} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{p}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Security note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>🔒</span>
                <span>All transactions are secured with 256-bit SSL encryption</span>
              </div>
            </div>

            {/* ── Right column — Order Summary ──────────── */}
            <div style={{ position: 'sticky', top: '90px' }}>
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--gradient-primary)', borderRadius: '50%', width: '26px', height: '26px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>3</span>
                  Order Summary
                </h3>

                {/* Items list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                  {cart.items?.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={item.product?.images?.[0] || 'https://via.placeholder.com/50'}
                          alt=""
                          style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'var(--bg-elevated)' }}
                        />
                        <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                          {item.quantity}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                          {item.product?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatPrice(item.price)} each</div>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  {[
                    ['Subtotal',    formatPrice(subtotal),  ''],
                    ['Shipping',    shipping === 0 ? 'FREE 🎉' : formatPrice(shipping), shipping === 0 ? 'var(--success)' : ''],
                    ['GST (18%)',   formatPrice(tax),        '']
                  ].map(([label, value, color]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>{label}</span>
                      <span style={{ color: color || 'inherit' }}>{value}</span>
                    </div>
                  ))}

                  {/* Divider */}
                  <div style={{ borderTop: '2px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                    <span>Total</span>
                    <span className="text-gradient">{formatPrice(total)}</span>
                  </div>

                  {/* Free shipping nudge */}
                  {shipping > 0 && subtotal > 0 && (
                    <div style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--success)' }}>
                      🎁 Add {formatPrice(1000 - subtotal)} more for <strong>free shipping</strong>!
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    type="submit"
                    id="place-order-btn"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', position: 'relative', overflow: 'hidden' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                        Processing…
                      </span>
                    ) : paymentMethod === 'cod' ? (
                      `📦 Place Order — ${formatPrice(total)}`
                    ) : (
                      `⚡ Pay ${formatPrice(total)} with Razorpay`
                    )}
                  </button>

                  <p style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By placing your order, you agree to our Terms & Privacy Policy
                  </p>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
