import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ArrowsClockwise,
  ArrowRight,
  Star,
} from '@phosphor-icons/react';

function ProductCatalog({
  token,
  user,
  searchQuery,
  onAddToCart,
  onBuyNow,
  cart = [],
  selectedCategory,
  onSelectCategory,
  onRequireAuth,
  onSelectProduct,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

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

  // Categories list
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  const activeCategory = selectedCategory || 'ALL';

  // Filter products by selected category
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

  // Dedicated sections
  const featuredProducts = products.slice(0, 4);
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
    const prod = quickViewProduct;
    const qty = modalQuantity;
    setQuickViewProduct(null);
    if (onBuyNow && prod) {
      onBuyNow(prod, qty);
    } else if (prod && onAddToCart) {
      for (let i = 0; i < qty; i++) {
        onAddToCart(prod);
      }
      if (!user && onRequireAuth) {
        onRequireAuth();
      }
    }
  };

  return (
    <div className="catalog-wrapper">
      {/* Minimalist Department Filter Bar */}
      <nav className="dept-strip" aria-label="Product categories">
        <div className="dept-inner">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`dept-pill ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat);
                  const catalogEl = document.getElementById('all-products-section');
                  if (catalogEl && cat !== 'ALL') {
                    catalogEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="container">
        {/* Error Notification */}
        {errorMessage && (
          <div className="alert-banner error">
            <span>{errorMessage}</span>
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              style={{ height: '28px', padding: '0 10px' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Minimalist Editorial Hero (Clean & Restrained) */}
        {!searchQuery && activeCategory === 'ALL' && (
          <header className="catalog-hero">
            <span className="hero-kicker">Catalog &middot; Everyday Essentials</span>
            <h1 className="hero-heading">Thoughtfully designed for everyday living.</h1>
            <p className="hero-subtext">
              A curated collection of electronics, apparel, and home goods focused on utility, craftsmanship, and enduring simplicity.
            </p>
          </header>
        )}

        {/* SECTION 1: Curated Highlights */}
        {!searchQuery && activeCategory === 'ALL' && featuredProducts.length > 0 && (
          <section className="product-section" id="featured-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Curated Selection</h2>
                <p className="section-subtitle">Key essentials from this season’s collection</p>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  const el = document.getElementById('all-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>View all products</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>

            <div className="product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: Electronics & Audio */}
        {!searchQuery && activeCategory === 'ALL' && electronicsProducts.length > 0 && (
          <section className="product-section" id="electronics-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Electronics & Devices</h2>
                <p className="section-subtitle">Audio, portable computers, and workspace tools</p>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('ELECTRONICS');
                  const el = document.getElementById('all-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Browse {electronicsProducts.length} items</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>

            <div className="product-grid">
              {electronicsProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3: Apparel & Everyday Wear */}
        {!searchQuery && activeCategory === 'ALL' && fashionProducts.length > 0 && (
          <section className="product-section" id="fashion-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Apparel & Carry</h2>
                <p className="section-subtitle">Footwear, garments, timepieces, and daypacks</p>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('APPAREL');
                  const el = document.getElementById('all-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Browse {fashionProducts.length} items</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>

            <div className="product-grid">
              {fashionProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: Objects & Living */}
        {!searchQuery && activeCategory === 'ALL' && homeProducts.length > 0 && (
          <section className="product-section" id="home-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">Living & Objects</h2>
                <p className="section-subtitle">Stoneware, desk lighting, ceramics, and personal scents</p>
              </div>
              <button
                type="button"
                className="section-view-all"
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('HOME');
                  const el = document.getElementById('all-products-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Browse {homeProducts.length} items</span>
                <ArrowRight size={14} weight="bold" />
              </button>
            </div>

            <div className="product-grid">
              {homeProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onQuickView={handleOpenQuickView}
                  onAddToCart={onAddToCart}
                  isInCart={getCartItemQuantity(product.productId)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5: All Products Grid with Clean Toolbar */}
        <section className="product-section" id="all-products-section" style={{ border: 'none', padding: 0 }}>
          <div className="catalog-toolbar">
            <div className="catalog-info">
              <span>
                {searchQuery.trim() ? (
                  <>
                    Search for “<strong>{searchQuery.trim()}</strong>” &middot;{' '}
                  </>
                ) : activeCategory !== 'ALL' ? (
                  <>
                    <strong>{activeCategory}</strong> &middot;{' '}
                  </>
                ) : (
                  <>All items &middot; </>
                )}
                <strong>{displayedProducts.length}</strong> available
              </span>
            </div>

            <div className="catalog-controls">
              {/* Category Filter */}
              <select
                className="filter-select"
                value={activeCategory}
                onChange={(e) => onSelectCategory && onSelectCategory(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="ALL">All Departments</option>
                {categories
                  .filter((c) => c !== 'ALL')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </option>
                  ))}
              </select>

              {/* Sort By */}
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">In Stock First</option>
              </select>

              {/* In-Stock Toggle */}
              <label className="instock-toggle">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In stock</span>
              </label>

              {/* Refresh */}
              <button
                type="button"
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={isLoading}
                title="Refresh product list"
              >
                <ArrowsClockwise
                  size={14}
                  weight="bold"
                  className={isLoading ? 'animate-spin' : ''}
                />
                <span>{isLoading ? 'Loading…' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Skeleton Loader */}
          {isLoading && (
            <div className="skeleton-grid" aria-label="Loading catalog">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          )}

          {/* Main Grid */}
          {!isLoading && displayedProducts.length > 0 && (
            <div className="product-grid">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onSelectProduct={onSelectProduct}
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
              <h3 className="empty-title">No items found</h3>
              <p className="empty-desc">
                No products match the selected criteria. Try adjusting your query or filters.
              </p>
              <button
                type="button"
                className="btn-solid"
                style={{ width: 'auto', padding: '0 20px', margin: '0 auto' }}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('ALL');
                  setInStockOnly(false);
                }}
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Empty Catalog State */}
          {!isLoading && products.length === 0 && !errorMessage && (
            <div className="empty-state">
              <h3 className="empty-title">No Products Available</h3>
              <p className="empty-desc">The catalog is currently empty.</p>
              <button
                type="button"
                className="btn-solid"
                style={{ width: 'auto', padding: '0 20px', margin: '0 auto' }}
                onClick={handleSeedDefaults}
              >
                Load catalog products
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Minimalist Quick View Modal */}
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
              aria-label="Close"
            >
              <X size={18} weight="bold" />
            </button>

            {/* Left: Image */}
            <div className="modal-image-col">
              {quickViewProduct.productImage ? (
                <img
                  src={quickViewProduct.productImage}
                  alt={quickViewProduct.productName}
                />
              ) : (
                <div className="product-initials" style={{ width: 100, height: 100, fontSize: 32 }}>
                  {quickViewProduct.productName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="modal-details-col">
              <div className="modal-dept">
                {quickViewProduct.category} &middot; SKU #{quickViewProduct.productId}
              </div>
              <h2 className="modal-title">{quickViewProduct.productName}</h2>

              <div className="modal-meta">
                <span className="card-price price-num" style={{ fontSize: '24px' }}>
                  ₹{Number(quickViewProduct.productPrice).toLocaleString('en-IN')}
                </span>
                <span className="card-rating" style={{ fontSize: '13px' }}>
                  <Star size={13} weight="fill" /> 4.6 &middot; In stock ({quickViewProduct.quantity})
                </span>
              </div>

              <p className="modal-desc">{quickViewProduct.description}</p>

              {/* Quantity Stepper */}
              <div className="modal-qty-row">
                <span style={{ fontSize: '13px', color: 'var(--ink-500)' }}>Quantity</span>
                <div className="qty-stepper">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus size={13} weight="bold" />
                  </button>
                  <span className="qty-display price-num">{modalQuantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => setModalQuantity((q) => q + 1)}
                  >
                    <Plus size={13} weight="bold" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-add-cart"
                  onClick={handleModalAdd}
                >
                  <ShoppingBag size={16} weight="regular" /> Add to Cart
                </button>
                <button
                  type="button"
                  className="btn-buy-now"
                  onClick={handleModalBuyNow}
                >
                  Purchase Now
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
