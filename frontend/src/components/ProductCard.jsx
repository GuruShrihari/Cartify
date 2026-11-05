import { useState } from 'react';
import { Star, Check, ShoppingBag, Eye } from '@phosphor-icons/react';

function ProductCard({ product, onSelectProduct, onQuickView, onAddToCart, isInCart }) {
  const [justAdded, setJustAdded] = useState(false);

  const currentPrice = Number(product.productPrice || 0);
  const formattedPrice = currentPrice.toLocaleString('en-IN');

  const idNum = parseInt(product.productId?.replace(/\D/g, '') || '101', 10);
  const rating = (4.2 + ((idNum % 7) * 0.1)).toFixed(1);

  const productInitials = String(product.productName || 'Item')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  const handleCardClick = () => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <article
      className="product-card"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Quick Preview Trigger on Hover */}
      <button
        type="button"
        className="card-quickview-btn"
        title="Quick preview"
        aria-label={`Preview ${product.productName}`}
        onClick={(e) => {
          e.stopPropagation();
          onQuickView && onQuickView(product);
        }}
      >
        <Eye size={16} weight="regular" />
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

      {/* Details */}
      <div className="card-info">
        <div className="card-dept">{product.category}</div>
        <h3 className="card-product-title" title={product.productName}>
          {product.productName}
        </h3>

        <div className="card-meta-row">
          <span className="card-price price-num">₹{formattedPrice}</span>
          <span className="card-rating">
            <Star size={12} weight="fill" /> {rating}
          </span>
        </div>
      </div>

      {/* Clean Minimal Add Button */}
      <button
        type="button"
        className={`card-add-btn ${justAdded || isInCart ? 'added' : ''}`}
        onClick={handleAdd}
        aria-label={`Add ${product.productName} to Cart`}
      >
        {justAdded ? (
          <>
            <Check size={14} weight="bold" /> Added
          </>
        ) : isInCart ? (
          <>
            <Check size={14} weight="bold" /> In Cart ({isInCart})
          </>
        ) : (
          <>
            <ShoppingBag size={14} weight="regular" /> Add to Cart
          </>
        )}
      </button>
    </article>
  );
}

export default ProductCard;
