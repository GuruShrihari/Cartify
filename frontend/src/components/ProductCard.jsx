import React, { useState } from 'react';

function ProductCard({ product, user }) {
  const [addedMessage, setAddedMessage] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const formattedPrice = Number(product.productPrice).toLocaleString('en-IN');

  const handleAddToCart = async () => {
    setIsAdding(true);
    setAddedMessage(null);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.emailId,
          productId: product.productId,
          productName: product.productName,
          productPrice: product.productPrice,
        }),
      });

      const data = await response.json();
      setAddedMessage({ text: data.message, isError: !response.ok });
    } catch (err) {
      setAddedMessage({ text: 'Failed to add to cart: ' + err.message, isError: true });
    } finally {
      setIsAdding(false);
      // Clear the feedback message after 2.5 seconds
      setTimeout(() => setAddedMessage(null), 2500);
    }
  };

  return (
    <article className="product-card">
      <div>
        <div className="card-top">
          <span className="badge-solid">ID: {product.productId}</span>
          <span className="badge-outline">{product.category.toUpperCase()}</span>
        </div>

        <h3 className="product-title">{product.productName}</h3>
        <p className="product-desc">{product.description}</p>
      </div>

      <div>
        <hr className="card-divider" />
        <div className="card-bottom">
          <div>
            <div className="price-label">Price</div>
            <div className="price-value">₹{formattedPrice}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stock-label">Stock</div>
            <div className="stock-value">{product.quantity} units</div>
          </div>
        </div>

        {/* Feedback message shown briefly after clicking Add to Cart */}
        {addedMessage && (
          <div
            className={`alert-banner ${addedMessage.isError ? 'error' : 'success'}`}
            style={{ marginTop: '12px', marginBottom: '0' }}
          >
            <span>{addedMessage.text}</span>
          </div>
        )}

        <button
          type="button"
          className="btn btn-solid btn-block"
          style={{ marginTop: '12px' }}
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? 'Adding...' : '+ Add to Cart'}
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
