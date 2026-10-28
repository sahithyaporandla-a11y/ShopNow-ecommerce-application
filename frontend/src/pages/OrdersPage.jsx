import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div className="skeleton" style={{ height: '2rem', width: '200px', marginBottom: '2rem', borderRadius: '8px' }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '130px', marginBottom: '1rem', borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    </div>
  );

  if (orders.length === 0) return (
    <div className="page-wrapper">
      <div className="container empty-state">
        <div className="empty-state-icon">📦</div>
        <h3>No orders yet</h3>
        <p>Place your first order and track it here</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>📦 My Orders</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order ID</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-light)' }}>#{order._id.slice(-8).toUpperCase()}</div>
                  </div>
                  <span className={`badge ${getStatusClass(order.orderStatus)}`} style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                    {order.orderStatus}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
                  {order.items?.slice(0, 4).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || 'https://via.placeholder.com/60'}
                      alt=""
                      style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', background: 'var(--bg-elevated)', flexShrink: 0 }}
                    />
                  ))}
                  {order.items?.length > 4 && (
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</div>
                      <div style={{ fontSize: '0.875rem' }}>{formatDate(order.createdAt)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Items</div>
                      <div style={{ fontSize: '0.875rem' }}>{order.items?.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment</div>
                      <div style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                        {order.paymentMethod} {order.isPaid ? '✅' : '⏳'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }} className="text-gradient">
                    {formatPrice(order.totalPrice)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
