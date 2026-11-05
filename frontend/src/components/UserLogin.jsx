import { useState } from 'react';
import { ArrowLeft, Sparkle } from '@phosphor-icons/react';

function UserLogin({ onLoginSuccess, onNavigateToRegister, onCancel }) {
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

  const handleDemoFill = () => {
    setEmailId('demo@cartify.com');
    setPassword('demo123');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ink-500)',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Continue shopping as Guest</span>
          </button>
        )}

        <div className="auth-header">
          <h2 className="page-title">Sign In to Cartify</h2>
          <p className="page-subtitle">
            Access your orders, saved addresses & personalised recommendations
          </p>
        </div>

        {errorMessage && (
          <div className="alert-banner error">
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email ID
            </label>
            <input
              id="login-email"
              type="email"
              className="text-input"
              placeholder="e.g. demo@cartify.com"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
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
            className="btn-solid"
            disabled={isSubmitting}
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>

          {/* Quick Demo Login Option */}
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              marginTop: '10px',
              width: '100%',
              height: '36px',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--ink-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkle size={14} weight="fill" color="var(--accent-gold)" />
            <span>Use Demo Account (demo@cartify.com)</span>
          </button>
        </form>

        <div className="auth-footer">
          New customer?
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToRegister}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
