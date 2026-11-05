import {
  MagnifyingGlass,
  ShoppingCart,
  User,
  SignOut,
  MapPin,
  Lightning,
  Sparkle,
  ShieldCheck,
} from '@phosphor-icons/react';

function Navbar({
  activeView,
  setActiveView,
  user,
  onLogout,
  searchQuery,
  onSearchChange,
  cartCount = 0,
  onOpenCart,
  selectedCategory,
  onSelectCategory,
  categories = [],
}) {
  const handleHomeClick = (e) => {
    e.preventDefault();
    setActiveView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveView('products');
    const catalogEl = document.getElementById('catalog-grid-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      {/* Main Bar */}
      <div className="nav-main">
        {/* Brand Logo */}
        <a
          href="#home"
          className="brand-logo"
          onClick={handleHomeClick}
          aria-label="Cartify Home"
        >
          <div className="brand-text">
            <span>Cart</span>
            <span className="brand-highlight">ify</span>
          </div>
          <div className="brand-sub">
            <span>Explore</span>
            <span className="plus-badge">Plus</span>
            <Sparkle size={10} weight="fill" color="var(--accent-gold)" />
          </div>
        </a>

        {/* Delivery Location Pill */}
        <div
          className="nav-location"
          title="Deliver to location"
          onClick={() => alert('Delivery is available nationwide across India with free shipping on orders over ₹499!')}
        >
          <MapPin size={18} weight="bold" className="loc-icon" />
          <div className="loc-texts">
            <span className="loc-label">Deliver to</span>
            <span className="loc-target">India 600001</span>
          </div>
        </div>

        {/* Search Bar with Category Scoping */}
        <form className="nav-search-form" onSubmit={handleSearchSubmit} role="search">
          <select
            className="nav-search-dept"
            value={selectedCategory || 'ALL'}
            onChange={(e) => {
              if (onSelectCategory) onSelectCategory(e.target.value);
              setActiveView('products');
            }}
            aria-label="Search department"
          >
            <option value="ALL">All Categories</option>
            {categories
              .filter((c) => c !== 'ALL')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <input
            type="search"
            className="nav-search-input"
            placeholder="Search for products, brands and more..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeView !== 'products') {
                setActiveView('products');
              }
            }}
            aria-label="Search products"
          />

          <button type="submit" className="nav-search-btn" aria-label="Search">
            <MagnifyingGlass size={20} weight="bold" />
          </button>
        </form>

        {/* Actions (Auth & Cart) */}
        <nav className="nav-actions" aria-label="Account & Cart">
          {user ? (
            <>
              <button
                type="button"
                className={`nav-action-btn ${activeView === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveView('profile')}
                title="Account Settings"
              >
                <User size={20} weight="bold" />
                <div className="nav-action-texts">
                  <span className="nav-action-subtitle">Hello, {user.username || 'User'}</span>
                  <span className="nav-action-title">Account & Orders</span>
                </div>
              </button>

              <button
                type="button"
                className="nav-action-btn"
                onClick={onLogout}
                title="Sign out of Cartify"
              >
                <SignOut size={18} weight="bold" />
                <span className="nav-action-title" style={{ fontSize: '13px' }}>
                  Sign Out
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="nav-auth-pill"
                onClick={() => setActiveView('login')}
              >
                Sign In
              </button>

              <button
                type="button"
                className="nav-action-btn"
                onClick={() => setActiveView('register')}
              >
                <div className="nav-action-texts">
                  <span className="nav-action-subtitle">New customer?</span>
                  <span className="nav-action-title">Start here</span>
                </div>
              </button>
            </>
          )}

          {/* Cart Button */}
          <button
            type="button"
            className="nav-cart-btn"
            onClick={onOpenCart}
            aria-label={`Shopping cart with ${cartCount} items`}
          >
            <div className="cart-icon-wrap">
              <ShoppingCart size={24} weight="bold" />
              <span className="cart-counter price-num">{cartCount}</span>
            </div>
            <span className="cart-label">Cart</span>
          </button>
        </nav>
      </div>

      {/* Sub Header / Category Bar */}
      <div className="nav-sub-strip">
        <div className="nav-sub-inner">
          <button
            type="button"
            className={`nav-sub-link ${activeView === 'products' && (!selectedCategory || selectedCategory === 'ALL') ? 'active' : ''}`}
            onClick={() => {
              if (onSelectCategory) onSelectCategory('ALL');
              setActiveView('products');
            }}
          >
            All Products
          </button>

          <button
            type="button"
            className="nav-sub-link"
            onClick={() => {
              setActiveView('products');
              const dealsEl = document.getElementById('flash-deals-section');
              if (dealsEl) dealsEl.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Lightning size={14} weight="fill" color="var(--accent-gold)" />
            <span>Today’s Lightning Deals</span>
            <span className="deal-tag">HOT</span>
          </button>

          <button
            type="button"
            className="nav-sub-link"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('ELECTRONICS');
              setActiveView('products');
              const el = document.getElementById('electronics-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Electronics
          </button>

          <button
            type="button"
            className="nav-sub-link"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('APPAREL');
              setActiveView('products');
              const el = document.getElementById('fashion-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Fashion & Lifestyle
          </button>

          <button
            type="button"
            className="nav-sub-link"
            onClick={() => {
              if (onSelectCategory) onSelectCategory('HOME');
              setActiveView('products');
              const el = document.getElementById('home-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Home & Living
          </button>

          <span className="nav-sub-link" style={{ marginLeft: 'auto', opacity: 0.85, fontSize: '12px' }}>
            <ShieldCheck size={14} weight="fill" color="#60a5fa" /> 100% Genuine & Easy Returns
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
