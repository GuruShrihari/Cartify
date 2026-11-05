import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import UserProfileManagement from './components/UserProfileManagement';
import CartView from './components/CartView';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const savedToken = localStorage.getItem('cartify_token');
    const savedUser = localStorage.getItem('cartify_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        setActiveView('products');
      } catch (e) {
        localStorage.removeItem('cartify_token');
        localStorage.removeItem('cartify_user');
      }
    }
  }, []);

  // Whenever the user is logged in, fetch the cart count so the Navbar badge stays accurate
  useEffect(() => {
    if (user) {
      fetchCartCount(user.emailId);
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Also re-fetch the count whenever the user switches to or away from the cart view
  useEffect(() => {
    if (user && activeView === 'cart') {
      fetchCartCount(user.emailId);
    }
  }, [activeView]);

  // Fetch just the number of distinct items in the cart (for the Navbar badge)
  const fetchCartCount = async (emailId) => {
    try {
      const response = await fetch(`/api/cart?emailId=${encodeURIComponent(emailId)}`);
      const data = await response.json();
      if (response.ok) {
        setCartCount(data.count || 0);
      }
    } catch (err) {
      // Silently ignore — the count badge is non-critical
    }
  };

  const handleLoginSuccess = ({ user: loggedInUser, token: authToken }) => {
    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('cartify_token', authToken);
    localStorage.setItem('cartify_user', JSON.stringify(loggedInUser));
    setActiveView('products');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCartCount(0);
    localStorage.removeItem('cartify_token');
    localStorage.removeItem('cartify_user');
    setActiveView('login');
  };

  const handleUpdateUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('cartify_user', JSON.stringify(updated));
  };

  const handleAccountDeleted = () => {
    handleLogout();
  };

  return (
    <div className="app-container">
      <div className="top-notice">
        Complimentary standard shipping on all orders &bull; 100% Authentic &bull; Cartify
      </div>

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <main className="container">
        {!user && activeView === 'login' && (
          <UserLogin
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setActiveView('register')}
          />
        )}

        {!user && activeView === 'register' && (
          <UserRegistration
            onNavigateToLogin={() => setActiveView('login')}
          />
        )}

        {user && activeView === 'products' && (
          <ProductCatalog
            token={token}
            user={user}
          />
        )}

        {user && activeView === 'cart' && (
          <CartView
            user={user}
            onCartChange={() => fetchCartCount(user.emailId)}
          />
        )}

        {user && activeView === 'profile' && (
          <UserProfileManagement
            user={user}
            onUpdateUser={handleUpdateUser}
            onAccountDeleted={handleAccountDeleted}
          />
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Cartify</strong> &mdash; Modern Minimalist Shopping Platform.
        </p>
      </footer>
    </div>
  );
}

export default App;
