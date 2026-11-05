import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import {
  Lightning,
  Truck,
  ShieldCheck,
  ArrowCounterClockwise,
  CreditCard,
  CaretRight,
  CaretLeft,
  X,
  Plus,
  Minus,
  ShoppingCart,
  Funnel,
  ArrowsClockwise,
  Star,
} from '@phosphor-icons/react';

// Department icon mapping
const DEPT_ICONS = {
  ALL: '🏷️',
  ELECTRONICS: '⚡',
  FOOTWEAR: '👟',
  ACCESSORIES: '⌚',
  BAGS: '🎒',
  AUDIO: '🎧',
  APPAREL: '👕',
  HOME: '🏡',
  BEAUTY: '✨',
};

const HERO_SLIDES = [
  {
    id: 1,
    badge: '⚡ Big Electronics Festival',
    title: 'Flagship Tech & Pro Audio at Unbeatable Prices',
    subtitle: 'Save up to 50% on Ultra Laptops, 4K Mirrorless Cameras & Studio Headphones.',
    cta: 'Explore Tech Deals',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
    category: 'ELECTRONICS',
  },
  {
    id: 2,
    badge: '🔥 Season Fashion Drop',
    title: 'Elevate Your Everyday Look & Footwear',
    subtitle: 'Classic aviators, chronograph timepieces, lightweight sneakers & weather-proof bags.',
    cta: 'Shop Lifestyle',
    bg: 'linear-gradient(135deg, #1c1917 0%, #292524 60%, #44403c 100%)',
    category: 'FOOTWEAR',
  },
  {
    id: 3,
    badge: '🏡 Modern Scandinavian Living',
    title: 'Curated Essentials for Your Home & Workspace',
    subtitle: 'Hand-glazed stoneware, warm dimmable lamps and luxury artisanal fragrances.',
    cta: 'Discover Home',
    bg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 60%, #0369a1 100%)',
    category: 'HOME',
  },
];

function ProductCatalog({
  token,
  user,
  searchQuery,
  onAddToCart,
  cart = [],
  selectedCategory,
  onSelectCategory,
  onRequireAuth,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Countdown timer for Deal of the Day (counts down from 8 hours)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance hero slides
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(slideInterval);
  }, []);

  // Load products on mount or when token/user changes
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (user?.emailId) headers['x-user-email'] = user.emailId;
        const res = await fetch('/api/products', { headers });
        const data = await res.json();
        if (!ignore) {
          if (!res.ok) {
            setErrorMessage(data.message || 'Failed to retrieve products from server.');
          } else {
            setProducts(data.products || []);
          }
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage('Network error fetching products: ' + err.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [token, user]);

  // Manual refresh callback
  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (user?.emailId) headers['x-user-email'] = user.emailId;
      const res = await fetch('/api/products', { headers });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to retrieve products from server.');
      } else {
        setProducts(data.products || []);
      }
    } catch (err) {
      setErrorMessage('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await handleRefresh();
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  // Active category filter
  const activeCategory = selectedCategory || 'ALL';

  // Filter products
  const categoryProducts =
    activeCategory === 'ALL'
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
        );

  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  let displayedProducts = normalizedQuery
    ? categoryProducts.filter((product) =>
        [product.productName, product.description, product.category].some((value) =>
          String(value || '').toLowerCase().includes(normalizedQuery)
        )
      )
    : categoryProducts;

  if (inStockOnly) {
    displayedProducts = displayedProducts.filter((p) => Number(p.quantity) > 0);
  }

  // Sort products
  displayedProducts = [...displayedProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.productPrice) - Number(b.productPrice);
    }
    if (sortBy === 'price-high') {
      return Number(b.productPrice) - Number(a.productPrice);
    }
    if (sortBy === 'stock') {
      return Number(b.quantity) - Number(a.quantity);
    }
    return 0; // featured default
  });

  // Curated collections for storefront sections
  const dealOfTheDayProducts = products.slice(0, 5);
  const electronicsProducts = products.filter(
    (p) => p.category === 'ELECTRONICS' || p.category === 'AUDIO'
  );
  const fashionProducts = products.filter(
    (p) =>
      p.category === 'APPAREL' ||
      p.category === 'FOOTWEAR' ||
      p.category === 'ACCESSORIES' ||
      p.category === 'BAGS'
  );
  const homeProducts = products.filter(
    (p) => p.category === 'HOME' || p.category === 'BEAUTY'
  );

  const getCartItemQuantity = (productId) => {
    const item = cart.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  const handleOpenQuickView = (product) => {
    setQuickViewProduct(product);
    setModalQuantity(1);
  };

  const handleModalAdd = () => {
    if (quickViewProduct && onAddToCart) {
      for (let i = 0; i < modalQuantity; i++) {
        onAddToCart(quickViewProduct);
      }
    }
    setQuickViewProduct(null);
  };

  const handleModalBuyNow = () => {
    if (quickViewProduct && onAddToCart) {
      onAddToCart(quickViewProduct);
    }
    setQuickViewProduct(null);
    if (!user && onRequireAuth) {
      onRequireAuth();
    } else {
      alert(`Proceeding to checkout for ${quickViewProduct.productName}!`);
    }
  };

  return (
    <div>
      {/* 1. Department Quick-Nav Bar (Flipkart Style Icons & Badges) */}
      <div className="dept-strip">
        <div className="dept-inner">
          {categories.map((cat) => {
            const icon = DEPT_ICONS[cat] || '✨';
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`dept-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat);
                  const catalogEl = document.getElementById('catalog-grid-section');
                  if (catalogEl && cat !== 'ALL') {
                    catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="dept-pill-icon">{icon}</span>
                <span className="dept-pill-label">
                  {cat === 'ALL' ? 'All Deals' : cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="container">
        {/* Error Notification */}
        {errorMessage && (
          <div className="alert-banner error">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              style={{ height: '30px', padding: '0 10px' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. Hero Deals Banner Carousel (Amazon/Flipkart Deal Slider) */}
        {!searchQuery && activeCategory === 'ALL' && (
          <div className="hero-slider-wrap">
            {HERO_SLIDES.map((slide, index) => {
              if (index !== currentSlide) return null;
              return (
                <div
                  key={slide.id}
                  className="hero-slide"
                  style={{ background: slide.bg }}
                >
                  <div className="hero-content">
                    <span className="hero-badge">{slide.badge}</span>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                    <button
                      type="button"
                      className="hero-cta"
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(slide.category);
                        const el = document.getElementById('catalog-grid-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span>{slide.cta}</span>
                      <CaretRight size={18} weight="bold" />
                    </button>
                  </div>

                  {/* Slider Arrows */}
                  <button
                    type="button"
                    className="hero-arrow prev"
                    onClick={() =>
                      setCurrentSlide(
                        (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                      )
                    }
                    aria-label="Previous slide"
                  >
                    <CaretLeft size={22} weight="bold" />
                  </button>
                  <button
                    type="button"
                    className="hero-arrow next"
                    onClick={() =>
                      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
                    }
                    aria-label="Next slide"
                  >
                    <CaretRight size={22} weight="bold" />
                  </button>

                  {/* Dot Indicators */}
                  <div className="hero-controls">
                    {HERO_SLIDES.map((_, i) => (
                      <div
                        key={i}
                        className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(i)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. Flipkart / Amazon Trust Badges Strip */}
        <div className="trust-strip">
          <div className="trust-item">
            <div className="trust-icon-box">
              <Truck size={24} weight="fill" />
            </div>
            <div>
              <div className="trust-title">Free Nationwide Delivery</div>
              <div className="trust-desc">On all orders above ₹499</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldCheck size={24} weight="fill" />
            </div>
            <div>
              <div className="trust-title">100% Genuine & Assured</div>
              <div className="trust-desc">Direct from verified brands</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <ArrowCounterClockwise size={24} weight="bold" />
            </div>
            <div>
              <div className="trust-title">7-Day Easy Returns</div>
              <div className="trust-desc">Hassle-free replacement policy</div>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <CreditCard size={24} weight="fill" />
            </div>
            <div>
              <div className="trust-title">Secure & Flexible Pay</div>
              <div className="trust-desc">UPI, Cards, EMI & COD available</div>
            </div>
          </div>
        </div>

        {/* 4. Section: ⚡ Lightning Deals of the Day (Live Ticking Countdown!) */}
        {!searchQuery && activeCategory === 'ALL' && dealOfTheDayProducts.length > 0 && (
          <section className="product-section" id="flash-deals-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-title-icon" style={{ color: '#e11d48' }}>
                  <Lightning size={26} weight="fill" />
                </span>
                <div>
                  <h2 className="section-title">Deals of the Day</h2>
                  <p className="section-subtitle">
                    Top picks with up to 50% discount · Limited time offers
                  </p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="deal-timer-wrap">
                <span className="deal-timer-label">
                  <Lightning size={14} weight="fill" /> Ends in:
                </span>
                <div className="deal-timer-digits">
                  <span className="timer-box">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span>:</span>
                  <span className="timer-box">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span>:</span>
                  <span className="timer-box">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            <div className="horizontal-products-row">
              {dealOfTheDayProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Section: 🔥 Electronics & Audio Showcase */}
        {!searchQuery && activeCategory === 'ALL' && electronicsProducts.length > 0 && (
          <section className="product-section" id="electronics-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-title-icon" style={{ color: '#2563eb' }}>
                  ⚡
                </span>
                <div>
                  <h2 className="section-title">Best in Electronics & Pro Audio</h2>
                  <p className="section-subtitle">
                    Laptops, mechanical keyboards, headphones & cameras
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('ELECTRONICS');
                  const el = document.getElementById('catalog-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>View all in Electronics</span>
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            <div className="horizontal-products-row">
              {electronicsProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Section: 👟 Lifestyle, Fashion & Footwear */}
        {!searchQuery && activeCategory === 'ALL' && fashionProducts.length > 0 && (
          <section className="product-section" id="fashion-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-title-icon">👟</span>
                <div>
                  <h2 className="section-title">Fashion, Watches & Accessories</h2>
                  <p className="section-subtitle">
                    Everyday styles crafted for comfort and clean aesthetics
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('APPAREL');
                  const el = document.getElementById('catalog-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore Fashion</span>
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            <div className="horizontal-products-row">
              {fashionProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 7. Section: 🏡 Home & Living Essentials */}
        {!searchQuery && activeCategory === 'ALL' && homeProducts.length > 0 && (
          <section className="product-section" id="home-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-title-icon">🏡</span>
                <div>
                  <h2 className="section-title">Home Decor & Fragrances</h2>
                  <p className="section-subtitle">
                    Minimal stoneware, ambient lighting & luxury scents
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('HOME');
                  const el = document.getElementById('catalog-grid-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>View Home Collection</span>
                <CaretRight size={16} weight="bold" />
              </button>
            </div>

            <div className="horizontal-products-row">
              {homeProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Main Catalog Section with Filter & Sort Toolbar */}
        <div id="catalog-grid-section" style={{ paddingTop: '8px' }}>
          <div className="catalog-toolbar">
            <div className="catalog-info">
              <Funnel size={18} weight="bold" color="var(--accent-blue)" />
              <span>
                {searchQuery.trim() ? (
                  <>
                    Results for “<strong>{searchQuery.trim()}</strong>” ·{' '}
                  </>
                ) : activeCategory !== 'ALL' ? (
                  <>
                    Department: <strong>{activeCategory}</strong> ·{' '}
                  </>
                ) : (
                  <>Showing All Products · </>
                )}
                <strong>{displayedProducts.length}</strong> items
              </span>
            </div>

            <div className="catalog-controls">
              {/* Category Dropdown */}
              <select
                className="filter-select"
                value={activeCategory}
                onChange={(e) => onSelectCategory && onSelectCategory(e.target.value)}
                aria-label="Department filter"
              >
                <option value="ALL">All Departments</option>
                {categories
                  .filter((c) => c !== 'ALL')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>

              {/* Sort By Dropdown */}
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Availability / Stock</option>
              </select>

              {/* In-Stock Toggle */}
              <label className="instock-toggle" title="Only display items with stock available">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>

              {/* Refresh Catalog */}
              <button
                type="button"
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh product list from server"
              >
                <ArrowsClockwise
                  size={16}
                  weight="bold"
                  className={isLoading ? 'animate-spin' : ''}
                />
                <span>{isLoading ? 'Loading…' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Skeleton Loader */}
          {isLoading && (
            <div className="skeleton-grid" aria-label="Loading products catalog">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && displayedProducts.length > 0 && (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          )}

          {/* Empty Search State */}
          {!isLoading && products.length > 0 && displayedProducts.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3 className="empty-title">No matching products found</h3>
              <p className="empty-desc">
                We couldn't find anything matching your search filters. Try clearing filters or exploring all departments.
              </p>
              <button
                type="button"
                className="btn-solid"
                style={{ width: 'auto', padding: '0 24px', margin: '0 auto' }}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('ALL');
                  setInStockOnly(false);
                }}
              >
                View All Products
              </button>
            </div>
          )}

          {/* Empty Database State */}
          {!isLoading && products.length === 0 && !errorMessage && (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">Product Catalog is Empty</h3>
              <p className="empty-desc">
                The database does not contain any products yet. Click below to seed the curated catalog with high-res Unsplash items.
              </p>
              <button
                type="button"
                className="btn-solid"
                style={{ width: 'auto', padding: '0 24px', margin: '0 auto' }}
                onClick={handleSeedDefaults}
              >
                Load Curated Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 9. Quick View Modal (Flipkart / Amazon Product Details Preview) */}
      {quickViewProduct && (
        <div
          className="modal-overlay"
          onClick={() => setQuickViewProduct(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close product modal"
            >
              <X size={20} weight="bold" />
            </button>

            {/* Left Column: Image */}
            <div className="modal-image-col">
              {quickViewProduct.productImage ? (
                <img
                  src={quickViewProduct.productImage}
                  alt={quickViewProduct.productName}
                />
              ) : (
                <div className="product-initials" style={{ width: 120, height: 120, fontSize: 40 }}>
                  {quickViewProduct.productName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Right Column: Details & CTA */}
            <div className="modal-details-col">
              <div className="modal-dept">
                {quickViewProduct.category} · Product #{quickViewProduct.productId}
              </div>
              <h2 className="modal-title">{quickViewProduct.productName}</h2>

              {/* Rating & Assured */}
              <div className="modal-ratings-row">
                <span className="rating-badge" style={{ padding: '3px 8px', fontSize: '13px' }}>
                  4.5 <Star size={12} weight="fill" />
                </span>
                <span className="review-count">Verified Customer Ratings</span>
                <span className="assured-pill">
                  <ShieldCheck size={14} weight="fill" /> Cartify Assured
                </span>
              </div>

              {/* Pricing Box */}
              <div className="modal-pricing-box">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span className="card-current-price price-num" style={{ fontSize: '26px' }}>
                    ₹{Number(quickViewProduct.productPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="card-mrp-price price-num">
                    ₹{Math.round(quickViewProduct.productPrice * 1.35).toLocaleString('en-IN')}
                  </span>
                  <span className="card-discount-tag" style={{ fontSize: '14px' }}>
                    35% OFF
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                  Special price inclusive of all taxes · Free Delivery
                </div>
              </div>

              {/* Description */}
              <p className="modal-desc">{quickViewProduct.description}</p>

              {/* Stock Status & Quantity Stepper */}
              <div className="modal-qty-row">
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Quantity
                  </div>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus size={14} weight="bold" />
                    </button>
                    <span className="qty-display price-num">{modalQuantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => setModalQuantity((q) => q + 1)}
                    >
                      <Plus size={14} weight="bold" />
                    </button>
                  </div>
                </div>

                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Availability</div>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: Number(quickViewProduct.quantity) > 0 ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {Number(quickViewProduct.quantity) > 0
                      ? `In Stock (${quickViewProduct.quantity} units)`
                      : 'Out of Stock'}
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-add-cart"
                  onClick={handleModalAdd}
                >
                  <ShoppingCart size={18} weight="bold" /> Add to Cart
                </button>
                <button
                  type="button"
                  className="btn-buy-now"
                  onClick={handleModalBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
