import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import ProductDetailPage from './components/ProductDetailPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import AdminDashboard from './components/AdminDashboard';
import CheckoutModal from './components/CheckoutModal';
import UserProfileManagement from './components/UserProfileManagement';
import CartDrawer from './components/CartDrawer';
import { Check } from '@phosphor-icons/react';
import './App.css';

function App() {
  // Default view is 'products' so guests can browse freely without login
  const [activeView, setActiveView] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Synchronous state initialization from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('cartify_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cartify_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Client-side persistent cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cartify_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Theme state: 'light' | 'dark' with localStorage persistence and OS preference detection
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('cartify_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  // Synchronize data-theme on <html> root element & sync meta theme-color
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem('cartify_theme', theme);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0d0f14' : '#fcfcfd');
      }
    } catch (e) {
      console.error('Failed to sync theme:', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Razorpay Checkout Modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cartify_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.productId === product.productId);
      if (existing) {
        return prevCart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showToast(`Added “${product.productName}” to your bag`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // Dedicated Product Page selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Buy Now direct from individual product page or quickview
  const handleDirectBuy = (product, quantity = 1) => {
    const total = Number(product.productPrice || 0) * quantity;
    setCheckoutItems([
      {
        productId: product.productId,
        productName: product.productName,
        productPrice: Number(product.productPrice),
        productImage: product.productImage,
        quantity,
      },
    ]);
    setCheckoutTotal(total);
    setIsCheckoutOpen(true);
  };

  // Cart checkout via Razorpay modal
  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce(
      (sum, item) => sum + Number(item.productPrice || 0) * item.quantity,
      0
    );
    setCheckoutItems(cart);
    setCheckoutTotal(total);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Payment completed & verified via backend + Resend email sent
  const handlePaymentSuccess = (order) => {
    setCurrentOrder(order);
    // Remove purchased items from cart if any
    const purchasedIds = new Set((order.items || []).map((i) => i.productId));
    setCart((prev) => prev.filter((i) => !purchasedIds.has(i.productId)));
    setActiveView('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Payment verified via Razorpay! Confirmation email dispatched.');
  };

  // Navigation with RBAC guard
  const handleNavigateView = (view) => {
    if (view === 'admin' && user?.role !== 'admin') {
      showToast('Admin privilege required to access portal');
      setActiveView('login');
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = ({ user: loggedInUser, token: authToken }) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('cartify_token', authToken);
    localStorage.setItem('cartify_user', JSON.stringify(loggedInUser));

    if (loggedInUser.role === 'admin') {
      setActiveView('admin');
      showToast(`Welcome Admin, ${loggedInUser.username}`);
    } else {
      setActiveView('products');
      showToast(`Welcome back, ${loggedInUser.username}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cartify_token');
    localStorage.removeItem('cartify_user');
    setActiveView('products');
    showToast('Signed out');
  };

  const handleUpdateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('cartify_user', JSON.stringify(updated));
    showToast('Profile updated');
  };

  const handleAccountDeleted = () => {
    handleLogout();
    showToast('Account record removed');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="minimal-toast">
          <Check size={16} weight="bold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={handleNavigateView}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Views Container */}
      <main>
        {/* Products View: accessible by ALL users without login */}
        {activeView === 'products' && (
          <ProductCatalog
            token={token}
            user={user}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
            cart={cart}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onRequireAuth={() => setActiveView('login')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* Dedicated Individual Product Detail Page */}
        {activeView === 'product-detail' && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setActiveView('products')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleDirectBuy}
            isInCart={cart.find((i) => i.productId === selectedProduct?.productId)?.quantity || 0}
          />
        )}

        {/* Order Confirmation / Success Page (Post-Razorpay Payment & Resend Dispatch) */}
        {activeView === 'order-success' && (
          <OrderSuccessPage
            order={currentOrder}
            onContinueShopping={() => setActiveView('products')}
            onNavigateToAccount={() => {
              if (user) setActiveView('profile');
              else setActiveView('login');
            }}
          />
        )}

        {/* RBAC Admin Portal: Restricted to role === 'admin' */}
        {activeView === 'admin' && (
          <AdminDashboard
            user={user}
            token={token}
            onNavigateToStore={() => setActiveView('products')}
          />
        )}

        {/* Login View */}
        {activeView === 'login' && (
          <div className="container">
            <UserLogin
              onLoginSuccess={handleLoginSuccess}
              onNavigateToRegister={() => setActiveView('register')}
              onCancel={() => setActiveView('products')}
            />
          </div>
        )}

        {/* Register View */}
        {activeView === 'register' && (
          <div className="container">
            <UserRegistration
              onNavigateToLogin={() => setActiveView('login')}
              onCancel={() => setActiveView('products')}
            />
          </div>
        )}

        {/* Profile Management View: requires authentication */}
        {activeView === 'profile' && user && (
          <div className="container">
            <UserProfileManagement
              user={user}
              onUpdateUser={handleUpdateUser}
              onAccountDeleted={handleAccountDeleted}
            />
          </div>
        )}
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCartCheckout}
        user={user}
      />

      {/* Razorpay Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        totalAmount={checkoutTotal}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Minimalist Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-name">Cartify</span>
            <p className="brand-tagline">Everyday objects, thoughtfully considered.</p>
          </div>

          <div className="footer-links">
            <button
              type="button"
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('ALL');
              }}
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('ELECTRONICS');
              }}
            >
              Electronics
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('APPAREL');
              }}
            >
              Apparel
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('HOME');
              }}
            >
              Living
            </button>
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveView('admin')}
                style={{ fontWeight: 600, color: 'var(--ink-900)' }}
              >
                Admin Portal
              </button>
            )}
          </div>

          <div className="footer-meta">
            &copy; {new Date().getFullYear()} Cartify. Designed with quiet restraint.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
