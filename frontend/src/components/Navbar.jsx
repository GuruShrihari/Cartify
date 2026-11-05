import React from 'react';
import { MagnifyingGlass, SignOut, UserCircle } from '@phosphor-icons/react';

function Navbar({ activeView, setActiveView, user, onLogout, searchQuery, onSearchChange }) {
  const showProducts = () => setActiveView(user ? 'products' : 'login');

  return (
    <header className="navbar">
      <div className="nav-inner">
        <a className="brand-logo" href="#home" onClick={(event) => { event.preventDefault(); showProducts(); }} aria-label="Cartify home">
          <span className="brand-mark">Cart</span><span>ify</span>
        </a>

        <form className="search-bar" role="search" onSubmit={(event) => { event.preventDefault(); showProducts(); }}>
          <input
            aria-label="Search Cartify products"
            type="search"
            placeholder="Search Cartify"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button type="submit" aria-label="Search products"><MagnifyingGlass size={20} weight="bold" /></button>
        </form>

        <nav className="nav-actions" aria-label="Account navigation">
          {user ? (
            <>
              <button type="button" className={`btn nav-link ${activeView === 'profile' ? 'active' : ''}`} onClick={() => setActiveView('profile')}>
                <small>Hello, {user.username}</small><strong><UserCircle size={16} weight="regular" /> Account</strong>
              </button>
              <button type="button" className="btn" onClick={onLogout}><SignOut size={17} /> Sign out</button>
            </>
          ) : (
            <>
              <button type="button" className={`btn ${activeView === 'login' ? 'active' : ''}`} onClick={() => setActiveView('login')}>Sign in</button>
              <button type="button" className={`btn ${activeView === 'register' ? 'active' : ''}`} onClick={() => setActiveView('register')}>Create account</button>
            </>
          )}
        </nav>
      </div>
      <nav className="nav-bottom" aria-label="Store navigation">
        <button type="button" onClick={showProducts}>Shop all</button>
        <a href="#catalog" onClick={(event) => { event.preventDefault(); showProducts(); }}>Today’s picks</a>
        {user && <button type="button" onClick={() => setActiveView('profile')}>Your account</button>}
      </nav>
    </header>
  );
}

export default Navbar;
