import React from 'react';

function Navbar({ activeView, setActiveView, user, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <div
          className="brand-logo"
          onClick={() => setActiveView(user ? 'products' : 'login')}
          title="Cartify - Simple Shopping Application"
        >
          <span className="brand-mark">C</span>
          <span>artify</span>
        </div>

        <nav className="nav-actions">
          {user ? (
            <>
              <button
                type="button"
                className={`btn ${activeView === 'products' ? 'btn-solid' : ''}`}
                onClick={() => setActiveView('products')}
              >
                Products
              </button>

              <button
                type="button"
                className={`btn ${activeView === 'profile' ? 'btn-solid' : ''}`}
                onClick={() => setActiveView('profile')}
              >
                Profile Management
              </button>

              <div className="user-badge">
                User: <strong>{user.username}</strong>
              </div>

              <button
                type="button"
                className="btn"
                onClick={onLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`btn ${activeView === 'login' ? 'btn-solid' : ''}`}
                onClick={() => setActiveView('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn ${activeView === 'register' ? 'btn-solid' : ''}`}
                onClick={() => setActiveView('register')}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
