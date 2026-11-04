import React from 'react';

function ProductCard({ product }) {
  const formattedPrice = Number(product.productPrice).toLocaleString('en-IN');

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
      </div>
    </article>
  );
}

export default ProductCard;
