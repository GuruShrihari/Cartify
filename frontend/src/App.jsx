import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import UserProfileManagement from './components/UserProfileManagement';
import CartDrawer from './components/CartDrawer';
import { Check } from '@phosphor-icons/react';
import './App.css';

function App() {
  // Default view is 'products' so guests can browse freely without login
  const [activeView, setActiveView] = useState('products');

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
    }, 2500);
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

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setActiveView('login');
      showToast('Please sign in or create an account to checkout.');
    } else {
      const total = cart.reduce(
        (sum, item) => sum + Number(item.productPrice || 0) * item.quantity,
        0
      );
      alert(
        `Order Confirmed\n\nThank you, ${user.username}.\nYour order of ${cart.length} item(s) (₹${total.toLocaleString(
          'en-IN'
        )}) is being prepared for dispatch.`
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
    showToast(`Welcome back, ${loggedInUser.username}`);
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

      {/* Minimalist Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-name">Cartify</span>
            <p className="brand-tagline">Everyday objects, thoughtfully considered.</p>
          </div>

          <div className="footer-links">
            <button type="button" onClick={() => { setActiveView('products'); setSelectedCategory('ALL'); }}>Catalog</button>
            <button type="button" onClick={() => { setActiveView('products'); setSelectedCategory('ELECTRONICS'); }}>Electronics</button>
            <button type="button" onClick={() => { setActiveView('products'); setSelectedCategory('APPAREL'); }}>Apparel</button>
            <button type="button" onClick={() => { setActiveView('products'); setSelectedCategory('HOME'); }}>Living</button>
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
