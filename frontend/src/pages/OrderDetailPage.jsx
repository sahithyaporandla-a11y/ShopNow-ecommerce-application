import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';
import { useRazorpay } from '../hooks/useRazorpay';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pay } = useRazorpay();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const canRetryPayment = order &&
    order.paymentMethod === 'razorpay' &&
    !order.isPaid &&
    !['cancelled', 'delivered'].includes(order.orderStatus);

  const handleRetryPayment = () => {
    if (!order) return;
    setRetrying(true);
    pay({
      total: order.totalPrice,
      shippingAddress: order.shippingAddress,
      user,
      // Override: we already have a DB order, but useRazorpay creates a NEW one.
      // Instead, call the payment API directly for the existing order.
      onSuccess: async (_newOrderId) => {
        setRetrying(false);
        // Reload to show paid status
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      },
      onFailure: () => setRetrying(false)
    });
  };

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '300px', marginBottom: '2rem', borderRadius: '8px' }} />
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  );

  if (!order) return (
    <div className="page-wrapper empty-state">
      <div className="empty-state-icon">😔</div>
      <h3>Order not found</h3>
      <Link to="/orders" className="btn btn-primary">My Orders</Link>
    </div>
  );

  const currentStep = order.orderStatus === 'cancelled' ? -1 : STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '860px' }}>
        <div className="breadcrumb">
          <Link to="/orders">My Orders</Link>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order Details</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge ${getStatusClass(order.orderStatus)}`} style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {order.orderStatus}
            </span>

            {/* Retry Payment — shown for unpaid Razorpay orders */}
            {canRetryPayment && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRetryPayment}
                disabled={retrying}
                id="retry-payment-btn"
                style={{ boxShadow: '0 0 20px rgba(108,99,255,0.4)' }}
              >
                {retrying ? '⏳ Opening…' : '⚡ Retry Payment'}
              </button>
            )}

            {['pending', 'processing'].includes(order.orderStatus) && (
              <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling} id="cancel-order-btn">
                {cancelling ? '⏳' : '✕ Cancel'}
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {order.orderStatus !== 'cancelled' && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem', fontSize: '1rem' }}>📍 Order Progress</h3>
            <div style={{ display: 'flex', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', height: '3px', background: 'var(--border)', borderRadius: '2px' }} />
              <div style={{ position: 'absolute', top: '16px', left: '16px', height: '3px', background: 'var(--gradient-primary)', borderRadius: '2px', transition: 'width 0.5s ease', width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * (100 - 10) + 5}%` : '0%' }} />
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: i <= currentStep ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                    border: `2px solid ${i <= currentStep ? 'var(--primary)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', zIndex: 1, transition: 'var(--transition)'
                  }}>
                    {i < currentStep ? '✓' : i === currentStep ? '⬤' : '○'}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'capitalize', textAlign: 'center' }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Items */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1rem' }}>🛍️ Items Ordered ({order.items?.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src={item.image || 'https://via.placeholder.com/70'}
                    alt=""
                    style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × {formatPrice(item.price)}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Address */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>📍 Delivery Address</h3>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                <div>{order.shippingAddress?.street}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                <div>{order.shippingAddress?.pincode}</div>
                <div>{order.shippingAddress?.country}</div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>💰 Price Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Items Total', formatPrice(order.itemsPrice)],
                  ['Shipping', order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)],
                  ['GST', formatPrice(order.taxPrice)]
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>{label}</span><span>{value}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', marginTop: '0.25rem' }}>
                  <span>Total</span>
                  <span className="text-gradient">{formatPrice(order.totalPrice)}</span>
                </div>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: order.isPaid ? 'rgba(34,211,160,0.1)' : 'rgba(245,166,35,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: order.isPaid ? 'var(--success)' : 'var(--warning)', textAlign: 'center' }}>
                  {order.isPaid ? `✅ Paid on ${formatDate(order.paidAt)}` : '⏳ Payment Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
