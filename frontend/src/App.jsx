import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import UserProfileManagement from './components/UserProfileManagement';
import CartDrawer from './components/CartDrawer';
import { Sparkle } from '@phosphor-icons/react';
import './App.css';

function App() {
  // Default view is 'products' so guests can browse freely without login (Flipkart/Amazon style)
  const [activeView, setActiveView] = useState('products');

  // Synchronous state initialization from localStorage (avoids cascading effect re-renders)
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
    }, 3000);
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
    showToast(`Added “${product.productName}” to your cart!`);
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

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setActiveView('login');
      showToast('Please sign in or create an account to complete checkout.');
    } else {
      const total = cart.reduce(
        (sum, item) => sum + Number(item.productPrice || 0) * item.quantity,
        0
      );
      alert(
        `🎉 Order Placed Successfully!\n\nThank you, ${user.username}!\nYour order of ${cart.length} item(s) totaling ₹${total.toLocaleString(
          'en-IN'
        )} will be delivered to your registered address in 24-48 hours.`
      );
      setCart([]);
      setIsCartOpen(false);
    }
  };

  const handleLoginSuccess = ({ user: loggedInUser, token: authToken }) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('cartify_token', authToken);
    localStorage.setItem('cartify_user', JSON.stringify(loggedInUser));
    setActiveView('products');
    showToast(`Welcome back, ${loggedInUser.username}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cartify_token');
    localStorage.removeItem('cartify_user');
    setActiveView('products');
    showToast('You have been signed out.');
  };

  const handleUpdateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('cartify_user', JSON.stringify(updated));
    showToast('Your profile details were updated.');
  };

  const handleAccountDeleted = () => {
    handleLogout();
    showToast('Your registration record has been removed.');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: '#111827',
            color: '#f9fafb',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out',
            border: '1px solid #374151',
          }}
        >
          <Sparkle size={18} weight="fill" color="var(--accent-gold)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar (Flipkart / Amazon Sale Banner) */}
      <div className="top-notice">
        <span className="highlight-badge">Super Savings</span>
        <span>
          Big Billion Day Deals Live &nbsp;·&nbsp; Free Nationwide Delivery on ₹499+ &nbsp;·&nbsp; Extra 10% Instant Discount on UPI
        </span>
      </div>

      {/* Main Header / Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Views Container */}
      <main>
        {/* Products View: accessible by ALL users without requiring login! */}
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
        onCheckout={handleCheckout}
        user={user}
      />

      {/* Comprehensive E-Commerce Footer (Amazon & Flipkart Style) */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col">
            <div className="footer-col-title" style={{ fontSize: '16px', color: 'var(--accent-gold)' }}>
              Cartify
            </div>
            <p>
              India’s trusted marketplace for everyday finds, premium tech, electronics, fashion, lifestyle, and modern home decor. Built with high standards of quality and verified authenticity.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', color: '#e5e7eb', fontSize: '13px' }}>
              <span>✓ 100% Original</span>
              <span>✓ 7-Day Returns</span>
              <span>✓ Safe Payments</span>
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">About & Info</div>
            <ul>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>About Cartify</a></li>
              <li><a href="#careers" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Careers</a></li>
              <li><a href="#press" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Press Releases</a></li>
              <li><a href="#science" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Cartify Science</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Help & Support</div>
            <ul>
              <li><a href="#payments" onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>Payments & Pricing</a></li>
              <li><a href="#shipping" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Shipping Policy</a></li>
              <li><a href="#cancellation" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Cancellation & Returns</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Frequently Asked Questions</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Consumer Policy</div>
            <ul>
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Security & Privacy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Terms of Use</a></li>
              <li><a href="#grievance" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Grievance Redressal</a></li>
              <li><a href="#sitemap" onClick={(e) => { e.preventDefault(); setActiveView('products'); }}>Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} <strong>Cartify Inc.</strong> &mdash; Everyday shopping made simple. Inspired by leading e-commerce standards.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
