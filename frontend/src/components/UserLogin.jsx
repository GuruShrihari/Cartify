import React, { useState } from 'react';

function UserLogin({ onLoginSuccess, onNavigateToRegister }) {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailId.trim() || !password) {
      setErrorMessage('Please enter both Email ID and Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailId: emailId.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Login failed.');
      } else {
        onLoginSuccess({
          user: data.user,
          token: data.token,
        });
      }
    } catch (err) {
      setErrorMessage('Network or server connection failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="page-title">Sign In</h2>
          <p className="page-subtitle">Welcome back! Please enter your credentials</p>
        </div>

        {errorMessage && (
          <div className="alert-banner error">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email ID</label>
            <input
              id="login-email"
              type="email"
              className="text-input"
              placeholder="e.g. shri@gmail.com"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="text-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-solid btn-block"
            disabled={isSubmitting}
            style={{ marginTop: '10px' }}
          >
            {isSubmitting ? 'Verifying...' : 'Sign In to Account'}
          </button>
        </form>

        <div className="auth-footer">
          New user?
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToRegister}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
