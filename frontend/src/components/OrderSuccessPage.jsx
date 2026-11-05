import { CheckCircle, EnvelopeSimple, ArrowRight, ShoppingBag } from '@phosphor-icons/react';

function OrderSuccessPage({ order, onContinueShopping, onNavigateToAccount }) {
  if (!order) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>No Order Details Found</h2>
        <button type="button" className="btn-solid" onClick={onContinueShopping} style={{ margin: '20px auto', width: 'auto' }}>
          Return to Store
        </button>
      </div>
    );
  }

  const items = order.items || [];
  const totalAmount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const orderDate = order.createdAt ? new Date(order.createdAt) : null;
  const formattedDate = orderDate
    ? orderDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Confirmed';

  return (
    <div className="container order-success-page">
      <div className="success-card">
        {/* Header Icon */}
        <div className="success-icon-wrap">
          <CheckCircle size={48} weight="fill" color="var(--success-text)" />
        </div>

        <span className="success-kicker">Order Placed Successfully</span>
        <h1 className="success-heading">Thank you for your purchase</h1>
        <p className="success-subtext">
          Your order has been confirmed via <strong>Razorpay</strong> and is being prepared for shipment.
        </p>

        {/* Resend Email Notice Pill */}
        <div className="email-sent-banner">
          <EnvelopeSimple size={18} weight="bold" color="var(--info-text)" />
          <span>
            Confirmation email receipt dispatched to <strong>{order.user?.emailId}</strong> via <em>noreply@sreeaditya.tech</em>
          </span>
        </div>

        {/* Order Metadata Box */}
        <div className="order-details-grid">
          <div className="meta-block">
            <span className="meta-label">Order Reference</span>
            <span className="meta-value price-num">#{order.orderId}</span>
          </div>

          <div className="meta-block">
            <span className="meta-label">Date & Time</span>
            <span className="meta-value">{formattedDate}</span>
          </div>

          <div className="meta-block">
            <span className="meta-label">Payment ID</span>
            <span className="meta-value price-num">
              {order.payment?.razorpayPaymentId || 'Verified Razorpay'}
            </span>
          </div>

          <div className="meta-block">
            <span className="meta-label">Fulfillment Status</span>
            <span className="meta-value status-tag">
              {order.fulfillmentStatus || 'Processing'}
            </span>
          </div>
        </div>

        {/* Items Summary Table */}
        <div className="order-items-section">
          <h3 className="order-items-title">Items in Order ({items.length})</h3>

          <div className="order-items-table">
            {items.map((item, index) => (
              <div key={index} className="order-summary-row">
                <div className="item-thumb-box">
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} />
                  ) : (
                    <span>{item.productName.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <div className="item-meta-box">
                  <span className="item-name">{item.productName}</span>
                  <span className="item-qty-price">
                    Qty: {item.quantity} &times; ₹{Number(item.productPrice).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="item-total-box price-num">
                  ₹{Number(item.itemTotal || item.productPrice * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="order-grand-total">
            <span>Total Paid via Razorpay</span>
            <span className="grand-price price-num">₹{totalAmount}</span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="shipping-recap-box">
          <span className="shipping-title">Shipping to</span>
          <p className="shipping-address">
            <strong>{order.shippingAddress?.fullName || order.user?.username}</strong><br />
            {order.shippingAddress?.addressLine || 'Standard Delivery'}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
            Contact: {order.shippingAddress?.phone}
          </p>
        </div>

        {/* Action Controls */}
        <div className="order-actions-row">
          <button
            type="button"
            className="btn-solid"
            onClick={onContinueShopping}
            style={{ width: 'auto', padding: '0 24px' }}
          >
            <ShoppingBag size={16} weight="regular" />
            <span>Continue Shopping</span>
          </button>

          {onNavigateToAccount && (
            <button
              type="button"
              className="btn-outline-minimal"
              onClick={onNavigateToAccount}
            >
              <span>View Your Account</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
