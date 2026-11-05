import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  MapPin,
  ArrowsClockwise,
  EnvelopeSimple,
} from '@phosphor-icons/react';

function UserOrdersPage({ user, token }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const headers = {};
        const authToken = token || localStorage.getItem('cartify_token');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const queryEmail = user.emailId ? `?emailId=${encodeURIComponent(user.emailId)}` : '';
        const res = await fetch(`/api/orders/my-orders${queryEmail}`, { headers });
        const data = await res.json();

        if (!ignore) {
          if (!res.ok) {
            setError(data.message || 'Failed to retrieve your order history.');
          } else {
            setOrders(data.orders || []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError('Network connection error: ' + err.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();
    return () => {
      ignore = true;
    };
  }, [user, token]);

  const fetchMyOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers = {};
      const authToken = token || localStorage.getItem('cartify_token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const queryEmail = user.emailId ? `?emailId=${encodeURIComponent(user.emailId)}` : '';
      const res = await fetch(`/api/orders/my-orders${queryEmail}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to retrieve your order history.');
      } else {
        setOrders(data.orders || []);
      }
    } catch (err) {
      setError('Network connection error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '440px', margin: '0 auto' }}>
          <Package size={44} weight="regular" color="var(--ink-500)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Sign In to View Orders</h2>
          <p style={{ color: 'var(--ink-500)', fontSize: '13.5px', marginBottom: '24px' }}>
            Please sign in to your Cartify account to review your past purchases, shipment statuses, and digital receipts.
          </p>
          <button
            type="button"
            className="btn-solid"
            onClick={() => navigate('/login', { state: { from: '/orders' } })}
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'ALL') return true;
    return (order.fulfillmentStatus || 'Processing').toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="container user-orders-page" style={{ padding: '32px 20px 80px', maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Breadcrumb */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
        <button type="button" className="btn-back" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} weight="bold" />
          <span>Back to Catalog</span>
        </button>
        <span className="crumb-divider">/</span>
        <span className="crumb-current">My Orders</span>
      </nav>

      {/* Page Header */}
      <div className="orders-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            My Orders
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-500)', margin: 0 }}>
            Orders placed under <strong>{user.emailId}</strong> ({orders.length} total)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-outline-minimal"
            onClick={fetchMyOrders}
            disabled={isLoading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', height: '36px' }}
          >
            <ArrowsClockwise size={14} weight="bold" className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="btn-solid"
            onClick={() => navigate('/products')}
            style={{ width: 'auto', padding: '0 18px', height: '36px', fontSize: '13px' }}
          >
            <ShoppingBag size={15} weight="regular" />
            <span>Browse Store</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <div className="orders-filter-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-line)', paddingBottom: '12px' }}>
          {['ALL', 'Processing', 'Shipped', 'Delivered'].map((status) => {
            const count = status === 'ALL'
              ? orders.length
              : orders.filter((o) => (o.fulfillmentStatus || 'Processing').toLowerCase() === status.toLowerCase()).length;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid ' + (isActive ? 'var(--ink-900)' : 'var(--border-line)'),
                  background: isActive ? 'var(--ink-900)' : 'var(--bg-surface)',
                  color: isActive ? '#ffffff' : 'var(--ink-700)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {status === 'ALL' ? 'All Orders' : status} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert-banner error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-500)', fontSize: '14px' }}>
          <ArrowsClockwise size={24} weight="bold" className="animate-spin" style={{ margin: '0 auto 12px', display: 'block' }} />
          <span>Loading your order history...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-line)', borderRadius: '8px', padding: '60px 24px', textAlign: 'center' }}>
          <Package size={48} weight="regular" color="var(--ink-400)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
            {statusFilter === 'ALL' ? 'No orders placed yet' : `No ${statusFilter} orders`}
          </h3>
          <p style={{ color: 'var(--ink-500)', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 24px' }}>
            {statusFilter === 'ALL'
              ? 'Items you purchase with Razorpay checkout will automatically appear here with live tracking receipts.'
              : `You do not currently have any orders marked as ${statusFilter}.`}
          </p>
          <button
            type="button"
            className="btn-solid"
            onClick={() => navigate('/products')}
            style={{ width: 'auto', margin: '0 auto', padding: '0 24px' }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map((order) => {
            const dateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Order';

            const status = order.fulfillmentStatus || 'Processing';
            let statusColor = 'var(--warning-text)';
            let statusBg = 'var(--warning-bg)';
            let statusBorder = 'var(--warning-border)';
            let statusIcon = <Clock size={13} weight="fill" />;

            if (status.toLowerCase() === 'delivered') {
              statusColor = 'var(--success-text)';
              statusBg = 'var(--success-bg)';
              statusBorder = 'var(--success-border)';
              statusIcon = <CheckCircle size={13} weight="fill" />;
            } else if (status.toLowerCase() === 'shipped') {
              statusColor = 'var(--info-text)';
              statusBg = 'var(--info-bg)';
              statusBorder = 'var(--info-border)';
              statusIcon = <Truck size={13} weight="fill" />;
            }

            return (
              <div
                key={order._id || order.orderId}
                className="user-order-card"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-line)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                {/* Order Card Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 20px',
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-line)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-sans)', color: 'var(--ink-900)' }}>
                      #{order.orderId}
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--ink-500)' }}>
                      {dateStr}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: statusColor,
                        background: statusBg,
                        border: `1px solid ${statusBorder}`,
                      }}
                    >
                      {statusIcon}
                      <span>{status}</span>
                    </span>

                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink-900)' }} className="price-num">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items in Order */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(order.items || []).map((item, idx) => {
                      const itemTotal = Number(item.productPrice || 0) * (item.quantity || 1);
                      return (
                        <div
                          key={item.productId || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '14px',
                            paddingBottom: idx === order.items.length - 1 ? '0' : '12px',
                            borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '6px',
                                background: 'var(--bg-subtle)',
                                border: '1px solid var(--border-line)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                                />
                              ) : (
                                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-400)' }}>
                                  {String(item.productName || 'IT').slice(0, 2).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <h4
                                style={{
                                  fontSize: '13.5px',
                                  fontWeight: 600,
                                  margin: '0 0 3px',
                                  color: 'var(--ink-900)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {item.productName}
                              </h4>
                              <span style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                                Qty: {item.quantity || 1} &times; ₹{Number(item.productPrice).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <strong style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-900)' }} className="price-num">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer: Shipping & Payment Meta */}
                <div
                  style={{
                    padding: '12px 20px',
                    background: 'var(--bg-subtle)',
                    borderTop: '1px solid var(--border-line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--ink-600)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} weight="regular" color="var(--ink-500)" />
                    <span>
                      Delivering to: <strong>{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CreditCard size={14} weight="bold" color="var(--success-text)" />
                      <span>Razorpay: <code>{order.payment?.razorpayPaymentId || 'Verified'}</code></span>
                    </div>

                    {order.emailSent && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--info-text)' }}>
                        <EnvelopeSimple size={14} weight="bold" />
                        <span>Receipt Dispatched</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserOrdersPage;

