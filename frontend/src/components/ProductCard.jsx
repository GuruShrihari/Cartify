import React from 'react';

function ProductCard({ product }) {
  const formattedPrice = Number(product.productPrice).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });
  const productInitials = String(product.productName || 'Item')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <article className="product-card">
      <div className="product-art">
        {product.productImage
          ? <img src={product.productImage} alt={product.productName} loading="lazy" />
          : <span aria-hidden="true">{productInitials}</span>}
      </div>
      <div>
        <div className="card-top">
          <span className="badge-outline">{product.category.toUpperCase()}</span>
        </div>

        <h3 className="product-title">{product.productName}</h3>
        <p className="product-desc">{product.description}</p>
      </div>

      <div className="product-meta">
        <div className="card-bottom">
          <div>
            <div className="price-label">Price</div>
            <div className="price-value">₹{formattedPrice}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stock-label">Availability</div>
            <div className="stock-value">{Number(product.quantity) > 0 ? 'In stock' : 'Out of stock'}</div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
