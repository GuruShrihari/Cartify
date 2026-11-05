import { useState } from 'react';
import { Star, Eye, ShoppingCart, Check, ShieldCheck } from '@phosphor-icons/react';

function ProductCard({ product, onQuickView, onAddToCart, isInCart }) {
  const [justAdded, setJustAdded] = useState(false);

  // Dynamic MRP and discount computation (Flipkart/Amazon style)
  const currentPrice = Number(product.productPrice || 0);
  const discountRate = 0.25 + ((parseInt(product.productId?.replace(/\D/g, '') || '5', 10) % 5) * 0.05); // 25% - 45% discount
  const mrpPrice = Math.round(currentPrice / (1 - discountRate));
  const discountPercent = Math.round(((mrpPrice - currentPrice) / mrpPrice) * 100);

  // Dynamic rating and review count based on product id
  const idNum = parseInt(product.productId?.replace(/\D/g, '') || '101', 10);
  const rating = (4.0 + ((idNum % 9) * 0.1)).toFixed(1);
  const reviewsCount = ((idNum * 37) % 800) + 120;
  const isBestSeller = idNum % 3 === 0;

  const formattedPrice = currentPrice.toLocaleString('en-IN');
  const formattedMrp = mrpPrice.toLocaleString('en-IN');

  const productInitials = String(product.productName || 'Item')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article
      className="product-card"
      onClick={() => onQuickView && onQuickView(product)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView && onQuickView(product);
        }
      }}
    >
      {/* Top Badges */}
      <div className="card-badges">
        <span className="badge-discount-tag">{discountPercent}% OFF</span>
        {isBestSeller && <span className="badge-bestseller">Best Seller</span>}
      </div>

      {/* Quick View Button */}
      <button
        type="button"
        className="card-quickview-btn"
        title="Quick View"
        aria-label={`Quick preview for ${product.productName}`}
        onClick={(e) => {
          e.stopPropagation();
          onQuickView && onQuickView(product);
        }}
      >
        <Eye size={18} weight="bold" />
      </button>

      {/* Product Image */}
      <div className="product-image-box">
        {product.productImage ? (
          <img
            src={product.productImage}
            alt={product.productName}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className="product-initials"
          style={{ display: product.productImage ? 'none' : 'flex' }}
        >
          {productInitials}
        </span>
      </div>

      {/* Department & Title */}
      <div className="card-dept">{product.category || 'General'}</div>
      <h3 className="card-product-title" title={product.productName}>
        {product.productName}
      </h3>

      {/* Star Ratings & Assured Badge */}
      <div className="card-rating-row">
        <span className="rating-badge">
          {rating} <Star size={11} weight="fill" />
        </span>
        <span className="review-count">({reviewsCount.toLocaleString()})</span>
        <span className="assured-pill" title="100% Genuine and Quality Verified">
          <ShieldCheck size={13} weight="fill" /> Assured
        </span>
      </div>

      {/* Pricing Row */}
      <div className="card-pricing-row">
        <span className="card-current-price price-num">₹{formattedPrice}</span>
        <span className="card-mrp-price price-num">₹{formattedMrp}</span>
        <span className="card-discount-tag">{discountPercent}% off</span>
      </div>

      {/* Delivery Promise */}
      <div className="card-delivery-promise">
        <span className="free-tag">FREE Delivery</span>
        <span>·</span>
        <span>Get it by <strong>Tomorrow</strong></span>
      </div>

      {/* Add to Cart CTA */}
      <button
        type="button"
        className={`card-add-btn ${justAdded || isInCart ? 'added' : ''}`}
        onClick={handleAdd}
        aria-label={`Add ${product.productName} to Cart`}
      >
        {justAdded ? (
          <>
            <Check size={16} weight="bold" /> Added to Cart
          </>
        ) : isInCart ? (
          <>
            <Check size={16} weight="bold" /> In Cart ({isInCart})
          </>
        ) : (
          <>
            <ShoppingCart size={16} weight="bold" /> Add to Cart
          </>
        )}
      </button>
    </article>
  );
}

export default ProductCard;
