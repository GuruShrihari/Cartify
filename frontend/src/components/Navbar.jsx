import {
  MagnifyingGlass,
  ShoppingBag,
  User,
  SignOut,
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
  onSelectCategory,
}) {
  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onSelectCategory) onSelectCategory('ALL');
    setActiveView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveView('products');
    const catalogEl = document.getElementById('all-products-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="nav-main">
        {/* Minimalist Logo */}
        <a
          href="#home"
          className="brand-logo"
          onClick={handleHomeClick}
          aria-label="Cartify Home"
        >
          <span className="brand-text">Cartify</span>
        </a>

        {/* Clean Minimal Search Input */}
        <form className="nav-search-form" onSubmit={handleSearchSubmit} role="search">
          <MagnifyingGlass size={16} weight="regular" className="search-icon" />
          <input
            type="search"
            className="nav-search-input"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (activeView !== 'products') {
                setActiveView('products');
              }
            }}
            aria-label="Search catalog"
          />
        </form>

        {/* Minimal Right Actions */}
        <nav className="nav-actions" aria-label="Account and Bag">
          {user ? (
            <>
              <button
                type="button"
                className={`nav-action-text-btn ${activeView === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveView('profile')}
              >
                <User size={16} weight="regular" />
                <span>{user.username}</span>
              </button>
              <button
                type="button"
                className="nav-action-icon-btn"
                onClick={onLogout}
                title="Sign out"
                aria-label="Sign out"
              >
                <SignOut size={16} weight="regular" />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`nav-action-text-btn ${activeView === 'login' ? 'active' : ''}`}
              onClick={() => setActiveView('login')}
            >
              Sign In
            </button>
          )}

          {/* Bag Button */}
          <button
            type="button"
            className="nav-cart-btn"
            onClick={onOpenCart}
            aria-label={`Shopping bag containing ${cartCount} items`}
          >
            <ShoppingBag size={18} weight="regular" />
            <span className="cart-counter price-num">{cartCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
