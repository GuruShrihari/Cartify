import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import ProductDetailPage from './components/ProductDetailPage';
import OrderSuccessPage from './components/OrderSuccessPage';
import AdminDashboard from './components/AdminDashboard';
import CheckoutPage from './components/CheckoutPage';
import CheckoutModal from './components/CheckoutModal';
import UserProfileManagement from './components/UserProfileManagement';
import CartDrawer from './components/CartDrawer';
import { Check } from '@phosphor-icons/react';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

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

  // Theme state: 'light' | 'dark'. Default is strictly 'light'.
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('cartify_theme');
      if (saved === 'dark' || saved === 'light') return saved;
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

  // Razorpay Checkout Modal state & direct checkout state
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
    navigate(`/products/${product.productId}`, { state: { product } });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Buy Now takes user directly to the dedicated Checkout Page (/checkout)
  const handleDirectBuy = (product, quantity = 1) => {
    const total = Number(product.productPrice || 0) * quantity;
    setCheckoutItems([
      {
        productId: product.productId,
        productName: product.productName,
        productPrice: Number(product.productPrice),
        productImage: product.productImage,
        category: product.category,
        quantity,
      },
    ]);
    setCheckoutTotal(total);
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart checkout takes user directly to the dedicated Checkout Page (/checkout)
  const handleCartCheckout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce(
      (sum, item) => sum + Number(item.productPrice || 0) * item.quantity,
      0
    );
    setCheckoutItems(cart);
    setCheckoutTotal(total);
    setIsCartOpen(false);
    navigate('/checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment completed & verified via backend + Resend email sent
  const handlePaymentSuccess = (order) => {
    setCurrentOrder(order);
    // Remove purchased items from cart if any
    const purchasedIds = new Set((order.items || []).map((i) => i.productId));
    setCart((prev) => prev.filter((i) => !purchasedIds.has(i.productId)));
    setCheckoutItems([]);
    setCheckoutTotal(0);
    navigate('/order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Payment verified via Razorpay! Confirmation email dispatched.');
  };

  const handleLoginSuccess = ({ user: loggedInUser, token: authToken }) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('cartify_token', authToken);
    localStorage.setItem('cartify_user', JSON.stringify(loggedInUser));

    if (loggedInUser.role === 'admin') {
      navigate('/admin');
      showToast(`Welcome Admin, ${loggedInUser.username}`);
    } else {
      navigate('/products');
      showToast(`Welcome back, ${loggedInUser.username}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cartify_token');
    localStorage.removeItem('cartify_user');
    navigate('/products');
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

  // Effective checkout items: if checkoutItems is empty but cart has items, fallback to cart
  const effectiveCheckoutItems = checkoutItems.length > 0 ? checkoutItems : cart;
  const effectiveCheckoutTotal = checkoutItems.length > 0
    ? checkoutTotal
    : cart.reduce((sum, item) => sum + Number(item.productPrice || 0) * item.quantity, 0);

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

      {/* Main Views Container via React Router */}
      <main>
        <Routes>
          {/* Products View: accessible by ALL users without login at / or /products */}
          <Route
            path="/"
            element={
              <ProductCatalog
                token={token}
                user={user}
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
                onBuyNow={handleDirectBuy}
                cart={cart}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onRequireAuth={() => navigate('/login')}
                onSelectProduct={handleSelectProduct}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductCatalog
                token={token}
                user={user}
                searchQuery={searchQuery}
                onAddToCart={handleAddToCart}
                onBuyNow={handleDirectBuy}
                cart={cart}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onRequireAuth={() => navigate('/login')}
                onSelectProduct={handleSelectProduct}
              />
            }
          />

          {/* Dedicated Individual Product Detail Page: e.g. /products/P101 */}
          <Route
            path="/products/:id"
            element={
              <ProductDetailPage
                product={selectedProduct}
                onBack={() => navigate('/products')}
                onAddToCart={handleAddToCart}
                onBuyNow={handleDirectBuy}
                isInCart={
                  cart.find((i) => i.productId === selectedProduct?.productId)?.quantity || 0
                }
              />
            }
          />

          {/* Dedicated Checkout Page: /checkout */}
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                items={effectiveCheckoutItems}
                totalAmount={effectiveCheckoutTotal}
                user={user}
                onPaymentSuccess={handlePaymentSuccess}
                onBack={() => navigate('/products')}
              />
            }
          />

          {/* Order Confirmation / Success Page: /order-success */}
          <Route
            path="/order-success"
            element={
              <OrderSuccessPage
                order={currentOrder}
                onContinueShopping={() => navigate('/products')}
                onNavigateToAccount={() => {
                  if (user) navigate('/profile');
                  else navigate('/login');
                }}
              />
            }
          />

          {/* RBAC Admin Portal: /admin */}
          <Route
            path="/admin"
            element={
              <AdminDashboard
                user={user}
                token={token}
                onNavigateToStore={() => navigate('/products')}
              />
            }
          />

          {/* Login View: /login */}
          <Route
            path="/login"
            element={
              <div className="container">
                <UserLogin
                  onLoginSuccess={handleLoginSuccess}
                  onNavigateToRegister={() => navigate('/register')}
                  onCancel={() => navigate('/products')}
                />
              </div>
            }
          />

          {/* Register View: /register */}
          <Route
            path="/register"
            element={
              <div className="container">
                <UserRegistration
                  onNavigateToLogin={() => navigate('/login')}
                  onCancel={() => navigate('/products')}
                />
              </div>
            }
          />

          {/* Profile Management View: /profile */}
          <Route
            path="/profile"
            element={
              user ? (
                <div className="container">
                  <UserProfileManagement
                    user={user}
                    onUpdateUser={handleUpdateUser}
                    onAccountDeleted={handleAccountDeleted}
                    onNavigateToAdmin={() => navigate('/admin')}
                  />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch-all redirect to products catalog */}
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
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

      {/* Razorpay Checkout Modal (fallback support) */}
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

          <div className="footer-meta">
            &copy; {new Date().getFullYear()} Cartify. Designed with quiet restraint.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
