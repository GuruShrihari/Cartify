import { useNavigate, useLocation } from 'react-router-dom';
import {
  MagnifyingGlass,
  ShoppingBag,
  User,
  SignOut,
  ShieldCheck,
  Sun,
  Moon,
  Package,
} from '@phosphor-icons/react';

function Navbar({
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onSelectCategory) onSelectCategory('ALL');
    navigate('/products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/' && location.pathname !== '/products') {
      navigate('/products');
    }
    const catalogEl = document.getElementById('all-products-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchChange = (val) => {
    onSearchChange(val);
    if (location.pathname !== '/' && location.pathname !== '/products') {
      navigate('/products');
    }
  };

  const isAdmin = user && user.role === 'admin';
  const isAdminActive = location.pathname.startsWith('/admin');
  const isProfileActive = location.pathname === '/profile';
  const isLoginActive = location.pathname === '/login';

  return (
    <header className="navbar">
      <div className="nav-main">
        {/* Minimalist Logo with logo.png */}
        <a
          href="/products"
          className="brand-logo"
          onClick={handleHomeClick}
          aria-label="Cartify Home"
        >
          <img src="/logo.png" alt="Cartify Logo" className="brand-logo-img" />
          <span className="brand-text">Cartify</span>
        </a>

        {/* Minimalist Search Bar */}
        <form className="nav-search-form" onSubmit={handleSearchSubmit} role="search">
          <MagnifyingGlass size={16} weight="bold" className="search-icon" aria-hidden="true" />
          <input
            type="search"
            className="nav-search-input"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search catalog"
          />
        </form>

        {/* Minimal Right Actions */}
        <nav className="nav-actions" aria-label="Account and Bag">
          {/* RBAC Admin Link: visible ONLY if role === 'admin' */}
          {isAdmin && (
            <button
              type="button"
              className={`nav-admin-pill ${isAdminActive ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
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
                className={`nav-action-text-btn ${location.pathname === '/orders' ? 'active' : ''}`}
                onClick={() => navigate('/orders')}
                title="View your order history"
              >
                <Package size={16} weight="regular" />
                <span>Orders</span>
              </button>
              <button
                type="button"
                className={`nav-action-text-btn ${isProfileActive ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
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
              className={`nav-action-text-btn ${isLoginActive ? 'active' : ''}`}
              onClick={() => navigate('/login')}
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
