import { useState } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Check,
  CreditCard,
  Plus,
  Minus,
} from '@phosphor-icons/react';

function ProductDetailPage({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
  isInCart = 0,
}) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button type="button" className="btn-solid" onClick={onBack} style={{ margin: '20px auto', width: 'auto' }}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const currentPrice = Number(product.productPrice || 0);
  const formattedPrice = currentPrice.toLocaleString('en-IN');
  const idNum = parseInt(product.productId?.replace(/\D/g, '') || '101', 10);
  const rating = (4.3 + ((idNum % 6) * 0.1)).toFixed(1);
  const reviewsCount = ((idNum * 23) % 400) + 45;

  const handleAdd = () => {
    if (onAddToCart) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product);
      }
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleDirectBuy = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity);
    }
  };

  return (
    <div className="container product-detail-page">
      {/* Top Breadcrumb & Back */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} weight="bold" />
          <span>Back to Catalog</span>
        </button>
        <span className="crumb-divider">/</span>
        <span className="crumb-category">{product.category}</span>
        <span className="crumb-divider">/</span>
        <span className="crumb-current">{product.productName}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="product-detail-layout">
        {/* Left Column: Image View */}
        <div className="product-detail-gallery">
          <div className="gallery-main-frame">
            {product.productImage ? (
              <img
                src={product.productImage}
                alt={product.productName}
                loading="eager"
              />
            ) : (
              <div className="product-initials-large">
                {product.productName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & Purchase Controls */}
        <div className="product-detail-content">
          <div className="detail-kicker">
            <span>{product.category}</span>
            <span className="sku-badge">SKU #{product.productId}</span>
          </div>

          <h1 className="detail-title">{product.productName}</h1>

          {/* Ratings & Price */}
          <div className="detail-meta-row">
            <div className="detail-price-box">
              <span className="detail-price price-num">₹{formattedPrice}</span>
              <span className="detail-price-sub">Tax included &middot; Free dispatch</span>
            </div>

            <div className="detail-rating-pill">
              <Star size={14} weight="fill" />
              <span>{rating}</span>
              <span className="rating-count">({reviewsCount} reviews)</span>
            </div>
          </div>

          {/* Description */}
          <div className="detail-desc-box">
            <h3 className="section-label">Overview</h3>
            <p className="detail-desc">{product.description}</p>
          </div>

          {/* Stock & Availability */}
          <div className="detail-stock-row">
            <span className="stock-indicator">
              <span
                className="status-dot"
                style={{
                  background: Number(product.quantity) > 0 ? 'var(--success-text)' : 'var(--error-text)',
                }}
              />
              {Number(product.quantity) > 0
                ? `Available in inventory (${product.quantity} units)`
                : 'Currently out of stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="detail-action-group">
            <div className="detail-qty-control">
              <span className="qty-label">Quantity</span>
              <div className="qty-stepper">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} weight="bold" />
                </button>
                <span className="qty-display price-num">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} weight="bold" />
                </button>
              </div>
            </div>

            {/* Buttons: Add to Bag & Buy Now via Razorpay */}
            <div className="detail-cta-grid">
              <button
                type="button"
                className={`btn-detail-add ${justAdded || isInCart ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check size={16} weight="bold" /> Added to Bag
                  </>
                ) : isInCart ? (
                  <>
                    <Check size={16} weight="bold" /> In Bag ({isInCart})
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} weight="regular" /> Add to Bag
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-detail-buy"
                onClick={handleDirectBuy}
              >
                <CreditCard size={16} weight="bold" />
                <span>Buy Now with Razorpay</span>
              </button>
            </div>
          </div>

          {/* Specifications Checklist */}
          <div className="detail-specs-card">
            <div className="spec-item">
              <span className="spec-key">Origin & Sourcing</span>
              <span className="spec-val">Direct from verified artisans & makers</span>
            </div>
            <div className="spec-item">
              <span className="spec-key">Packaging</span>
              <span className="spec-val">100% recyclable, minimal protective carton</span>
            </div>
            <div className="spec-item">
              <span className="spec-key">Returns Policy</span>
              <span className="spec-val">7 days return & replacement support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
