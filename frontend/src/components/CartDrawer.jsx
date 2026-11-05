import { X, Trash, Plus, Minus, ArrowRight, ShoppingBag } from '@phosphor-icons/react';

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

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title">
            <ShoppingBag size={18} weight="regular" />
            <span>Bag ({totalItems})</span>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Cart Item List */}
        {cart.length === 0 ? (
          <div className="empty-state" style={{ margin: 'auto 20px', border: 'none' }}>
            <h3 className="empty-title">Your bag is empty</h3>
            <p className="empty-desc">
              Items you add to your bag while browsing will appear here.
            </p>
            <button
              type="button"
              className="btn-solid"
              style={{ width: 'auto', padding: '0 20px', margin: '0 auto' }}
              onClick={onClose}
            >
              Explore Catalog
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
                      <span style={{ fontWeight: 600 }}>
                        {item.productName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="cart-item-body">
                    <h4 className="cart-item-title" title={item.productName}>
                      {item.productName}
                    </h4>
                    <div className="cart-item-price price-num">
                      ₹{Number(item.productPrice).toLocaleString('en-IN')}{' '}
                      {item.quantity > 1 && (
                        <span className="cart-item-subprice">
                          &middot; ₹{itemTotal.toLocaleString('en-IN')} total
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus size={12} weight="bold" />
                        </button>
                        <span className="qty-display price-num">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="qty-btn"
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
                    <Trash size={16} weight="regular" />
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
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span style={{ color: 'var(--ink-700)' }}>Calculated at checkout</span>
            </div>

            <div className="cart-total-row">
              <span>Total</span>
              <span className="price-num">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              type="button"
              className="btn-checkout"
              onClick={onCheckout}
            >
              <span>{user ? 'Proceed to Checkout' : 'Sign In & Checkout'}</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
