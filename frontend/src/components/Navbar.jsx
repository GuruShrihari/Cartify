import {
  MagnifyingGlass,
  ShoppingBag,
  User,
  SignOut,
  ShieldCheck,
  Sun,
  Moon,
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
  theme = 'light',
  onToggleTheme,
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

  const isAdmin = user && user.role === 'admin';

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
          {/* RBAC Admin Link: visible ONLY if role === 'admin' */}
          {isAdmin && (
            <button
              type="button"
              className={`nav-admin-pill ${activeView === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveView('admin')}
              title="Admin Management & Analytics"
            >
              <ShieldCheck size={16} weight="fill" />
              <span>Admin Portal</span>
            </button>
          )}

          {/* Theme Mode Toggle */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun size={18} weight="regular" />
            ) : (
              <Moon size={18} weight="regular" />
            )}
          </button>

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
