import React, { useState, useEffect } from 'react';

function CartView({ user }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch the cart items for the logged-in user from the backend
  const fetchCart = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/cart?emailId=${encodeURIComponent(user.emailId)}`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to load cart.');
      } else {
        setCartItems(data.cartItems || []);
      }
    } catch (err) {
      setErrorMessage('Network error loading cart: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user.emailId]);

  // Increase or decrease quantity of a single item
  const handleQuantityChange = async (itemId, action) => {
    try {
      const response = await fetch(`/api/cart/${itemId}?action=${action}`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage('Error: ' + data.message);
      } else {
        // Refresh the cart so the displayed list stays in sync
        await fetchCart();
      }
    } catch (err) {
      setStatusMessage('Request failed: ' + err.message);
    }
  };

  // Remove a single item from the cart
  const handleRemoveItem = async (itemId, productName) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage('Error: ' + data.message);
      } else {
        setStatusMessage(data.message);
        await fetchCart();
      }
    } catch (err) {
      setStatusMessage('Request failed: ' + err.message);
    }
  };

  // Clear the entire cart for this user
  const handleClearCart = async () => {
    try {
      const response = await fetch(`/api/cart?emailId=${encodeURIComponent(user.emailId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage('Error: ' + data.message);
      } else {
        setStatusMessage(data.message);
        setCartItems([]);
      }
    } catch (err) {
      setStatusMessage('Request failed: ' + err.message);
    }
  };

  // Calculate the total price of all items in the cart
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.productPrice * item.quantity,
    0
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Your Cart</h2>
          <p className="page-subtitle">
            Items you have added for purchase — adjust quantities or remove as needed
          </p>
        </div>

        <div className="page-controls">
          <button
            type="button"
            className="btn"
            onClick={fetchCart}
            disabled={isLoading}
          >
            <span>&#x21bb;</span>
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* One-line status feedback (item removed, cart cleared, etc.) */}
      {statusMessage && (
        <div className="alert-banner success" style={{ marginBottom: '24px' }}>
          <span>{statusMessage}</span>
          <button
            type="button"
            className="btn"
            style={{ padding: '4px 8px' }}
            onClick={() => setStatusMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert-banner error">
          <span>{errorMessage}</span>
          <button type="button" className="btn" onClick={fetchCart} style={{ padding: '4px 8px' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="empty-state">
          <h3>Loading Cart...</h3>
          <p>Fetching your saved items...</p>
        </div>
      )}

      {/* Empty cart message */}
      {!isLoading && cartItems.length === 0 && !errorMessage && (
        <div className="empty-state">
          <h3>Your Cart is Empty</h3>
          <p>Go to the Products page and click &ldquo;Add to Cart&rdquo; on any item.</p>
        </div>
      )}

      {/* Cart items list */}
      {!isLoading && cartItems.length > 0 && (
        <div>
          {cartItems.map((item) => (
            <div key={item._id} className="cart-row">
              <div className="cart-row-info">
                <span className="badge-solid" style={{ marginRight: '10px' }}>
                  {item.productId}
                </span>
                <span className="cart-item-name">{item.productName}</span>
              </div>

              <div className="cart-row-controls">
                {/* Decrease quantity (removes item if quantity would reach 0) */}
                <button
                  type="button"
                  className="btn cart-qty-btn"
                  onClick={() => handleQuantityChange(item._id, 'decrease')}
                  title="Decrease quantity"
                >
                  −
                </button>

                <span className="cart-qty-display">{item.quantity}</span>

                {/* Increase quantity */}
                <button
                  type="button"
                  className="btn cart-qty-btn"
                  onClick={() => handleQuantityChange(item._id, 'increase')}
                  title="Increase quantity"
                >
                  +
                </button>

                <span className="cart-item-price">
                  ₹{(item.productPrice * item.quantity).toLocaleString('en-IN')}
                </span>

                {/* Remove item entirely */}
                <button
                  type="button"
                  className="btn"
                  style={{ padding: '4px 10px' }}
                  onClick={() => handleRemoveItem(item._id, item.productName)}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Summary row at the bottom */}
          <div className="cart-summary">
            <div className="cart-total">
              <span className="cart-total-label">Total ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
              <span className="cart-total-value">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn btn-solid"
                onClick={() => alert('Checkout coming soon!')}
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartView;

