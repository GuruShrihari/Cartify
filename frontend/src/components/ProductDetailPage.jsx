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

  const product = propProduct || fetchedProduct;

  useEffect(() => {
    if (propProduct || !id) return;

    let isMounted = true;
    async function load() {
      setIsLoading(true);
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
        if (isMounted) setFetchError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
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
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-500)', fontSize: '14px' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
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
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{product.category}</span>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current truncate">{product.productName}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="detail-layout-grid">
        {/* Left: Gallery Showcase */}
        <div className="detail-gallery-col">
          <div className="gallery-main-frame">
            <img
              src={product.productImage}
              alt={product.productName}
              className="gallery-hero-image"
              loading="eager"
            />
          </div>
        </div>

        {/* Right: Product Spec & Purchase Controller */}
        <div className="detail-info-col">
          <div className="detail-tag-row">
            <span className="dept-tag">{product.category}</span>
            <div className="detail-rating-pill" aria-label={`Rating ${rating} out of 5 stars`}>
              <Star size={13} weight="fill" />
              <span>{rating}</span>
              <span className="rating-count">({reviewsCount})</span>
            </div>
          </div>

          <h1 className="detail-product-title">{product.productName}</h1>
          <p className="detail-sku">SKU: <span className="price-num">{product.productId}</span></p>

          <div className="detail-price-box">
            <span className="detail-price-currency">₹</span>
            <span className="detail-price-value price-num">{formattedPrice}</span>
            <span className="detail-price-taxes">Taxes included &middot; Free express shipping</span>
          </div>

          <div className="detail-description-block">
            <h3 className="section-label">Design & Details</h3>
            <p className="detail-description-text">
              {product.description ||
                'Thoughtfully designed for everyday living, built with high-grade components that blend seamless utility with refined minimalist aesthetics.'}
            </p>
          </div>

          {/* Action Row */}
          <div className="detail-action-card">
            <div className="qty-row">
              <span className="qty-label">Quantity</span>
              <div className="qty-selector">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} weight="bold" />
                </button>
                <span className="qty-num price-num">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(Number(product.quantity) || 99, q + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus size={14} weight="bold" />
                </button>
              </div>
              <span className="stock-hint">
                {product.quantity > 0 ? (
                  <span className="stock-in price-num">{product.quantity} units in stock</span>
                ) : (
                  <span className="stock-out">Backorder</span>
                )}
              </span>
            </div>

            <div className="detail-cta-group">
              <button
                type="button"
                className={`btn-solid btn-add-bag ${justAdded ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {justAdded ? (
                  <>
                    <Check size={18} weight="bold" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} weight="regular" />
                    <span>Add to Bag {isInCart > 0 ? `(${isInCart} in bag)` : ''}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-pay-now"
                onClick={handleDirectBuy}
              >
                <CreditCard size={18} weight="regular" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="detail-specs-card">
            <div className="spec-row">
              <span className="spec-label">Guaranteed</span>
              <span className="spec-val">100% Genuine & Assured</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Dispatched via</span>
              <span className="spec-val">Bluedart & Delhivery Air</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Payment Security</span>
              <span className="spec-val">256-bit Encrypted Razorpay Gateway</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">Return Policy</span>
              <span className="spec-val">7-Day Hassle-free replacement</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
