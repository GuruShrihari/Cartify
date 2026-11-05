import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ProductCatalog from './components/ProductCatalog';
import UserProfileManagement from './components/UserProfileManagement';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
        Good finds for your everyday &nbsp;·&nbsp; Welcome to Cartify
      </div>

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
            searchQuery={searchQuery}
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
          <strong>Cartify</strong> &mdash; Everyday shopping, made simple.
        </p>
      </footer>
    </div>
  );
}

export default App;
