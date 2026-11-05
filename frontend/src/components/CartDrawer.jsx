import { ShoppingCart, X, Trash, Plus, Minus, ArrowRight, ShieldCheck } from '@phosphor-icons/react';

function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  user,
}) {
  if (!isOpen) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.productPrice || 0) * item.quantity,
    0
  );
  const estimatedSavings = Math.round(subtotal * 0.35);

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingCart size={22} weight="bold" />
            <span>Shopping Cart ({totalItems})</span>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Cart Item List */}
        {cart.length === 0 ? (
          <div className="empty-state" style={{ margin: 'auto 20px', border: 'none' }}>
            <div className="empty-icon">🛒</div>
            <h3 className="empty-title">Your Cart is Empty</h3>
            <p className="empty-desc">
              Looks like you haven't added anything to your cart yet. Explore today's best deals!
            </p>
            <button
              type="button"
              className="btn-solid"
              style={{ width: 'auto', padding: '0 20px', margin: '0 auto' }}
              onClick={onClose}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="cart-items-list">
            {cart.map((item) => {
              const itemTotal = Number(item.productPrice || 0) * item.quantity;
              return (
                <div key={item.productId} className="cart-item-card">
                  <div className="cart-item-thumb">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} />
                    ) : (
                      <span style={{ fontWeight: 800 }}>
                        {item.productName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="cart-item-title" title={item.productName}>
                      {item.productName}
                    </h4>
                    <div className="cart-item-price price-num">
                      ₹{Number(item.productPrice).toLocaleString('en-IN')}{' '}
                      <small style={{ color: '#6b7280', fontWeight: 500 }}>
                        x {item.quantity} = ₹{itemTotal.toLocaleString('en-IN')}
                      </small>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <div className="qty-stepper" style={{ height: '28px' }}>
                        <button
                          type="button"
                          className="qty-btn"
                          style={{ width: '28px', height: '28px' }}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus size={12} weight="bold" />
                        </button>
                        <span className="qty-display price-num" style={{ width: '32px', fontSize: '12px' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
                          style={{ width: '28px', height: '28px' }}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus size={12} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="cart-item-delete"
                    onClick={() => onRemoveItem(item.productId)}
                    title="Remove item"
                    aria-label={`Remove ${item.productName}`}
                  >
                    <Trash size={18} weight="bold" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Subtotal ({totalItems} items)</span>
              <span className="price-num">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-summary-row" style={{ color: '#16a34a' }}>
              <span>Instant Deal Discount</span>
              <span className="price-num">-₹{estimatedSavings.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="cart-total-row">
              <span>Total Amount</span>
              <span className="price-num">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={onCheckout}
            >
              <span>{user ? 'Proceed to Checkout' : 'Sign in & Checkout'}</span>
              <ArrowRight size={18} weight="bold" />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '11.5px',
                color: '#6b7280',
                marginTop: '12px',
              }}
            >
              <ShieldCheck size={16} weight="fill" color="#2563eb" />
              <span>Safe and Secure Payments · 100% Authentic</span>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
