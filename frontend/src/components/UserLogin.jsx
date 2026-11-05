import { useState } from 'react';
import { ArrowLeft, ShieldCheck, User } from '@phosphor-icons/react';

function UserLogin({ onLoginSuccess, onNavigateToRegister, onCancel }) {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
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
    setEmailId('shonlyforstudies@gmail.com');
    setPassword('demo123');
  };

  const handleAdminFill = () => {
    setEmailId('admin@cartify.com');
    setPassword('admin123');
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
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            <ArrowLeft size={16} weight="bold" />
            <span>Continue as Guest</span>
          </button>
        )}

        <div className="auth-header">
          <h2 className="page-title">Sign In to Cartify</h2>
          <p className="page-subtitle">
            Customer orders, personalized catalog & admin RBAC management
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
              placeholder="e.g. shonlyforstudies@gmail.com"
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
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>

          {/* Quick Login Helpers for Evaluator / User */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                width: '100%',
                height: '34px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-line)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--ink-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <User size={14} weight="regular" />
              <span>Fill Customer (shonlyforstudies@gmail.com / demo123)</span>
            </button>

            <button
              type="button"
              onClick={handleAdminFill}
              style={{
                width: '100%',
                height: '34px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-line)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--ink-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={15} weight="fill" color="#3b82f6" />
              <span>Fill Admin (admin@cartify.com / admin123)</span>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          New to Cartify?
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
