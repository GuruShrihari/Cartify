import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  product: propProduct,
  cart = [],
  onBack,
  onAddToCart,
  onBuyNow,
  isInCart = 0,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(!propProduct && !!id);
  const [fetchError, setFetchError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const product = (propProduct && (!id || propProduct.productId === id)) ? propProduct : fetchedProduct;

  useEffect(() => {
    if ((propProduct && (!id || propProduct.productId === id)) || !id) {
      return;
    }

    if (!id) return;

    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.product) {
            setFetchedProduct(data.product);
          } else {
            setFetchError(data.message || 'Product not found');
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.message || 'Error loading product');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id, propProduct]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/products');
    }
  };

  if (isLoading) {
    return (
      <div className="container product-detail-page" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-500)', fontSize: '14px' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container product-detail-page" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2>{fetchError || 'Product not found'}</h2>
        <button
          type="button"
          className="btn-solid"
          onClick={handleBack}
          style={{ margin: '20px auto', width: 'auto' }}
        >
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

  const currentInBagCount =
    cart.find((i) => i.productId === product.productId)?.quantity || isInCart || 0;

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
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="container product-detail-page">
      {/* Top Breadcrumb & Back */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="btn-back" onClick={handleBack}>
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
            <p className="detail-desc">
              {product.description ||
                'Thoughtfully designed for everyday living, built with high-grade components that blend seamless utility with refined minimalist aesthetics.'}
            </p>
          </div>

          {/* Stock & Availability */}
          <div className="detail-stock-row">
            <span className="stock-indicator">
              <span
                className="status-dot"
                style={{
                  background:
                    Number(product.quantity) > 0 ? 'var(--success-text)' : 'var(--error-text)',
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
                className={`btn-detail-add ${justAdded || currentInBagCount > 0 ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check size={16} weight="bold" /> Added to Bag
                  </>
                ) : currentInBagCount > 0 ? (
                  <>
                    <Check size={16} weight="bold" /> In Bag ({currentInBagCount})
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
                <span>Buy Now</span>
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
              <span className="spec-key">Payment Security</span>
              <span className="spec-val">256-bit Encrypted Razorpay Gateway</span>
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
