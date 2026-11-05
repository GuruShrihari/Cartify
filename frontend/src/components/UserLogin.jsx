import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, User, LockSimple, Check } from '@phosphor-icons/react';

function UserLogin({ onLoginSuccess, onNavigateToRegister, onCancel }) {
  const location = useLocation();
  const returnTarget = location.state?.from || null;
  const notice = location.state?.notice || null;

  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filledRole, setFilledRole] = useState(null);

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
        onLoginSuccess(
          {
            user: data.user,
            token: data.token,
          },
          returnTarget
        );
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
    setErrorMessage(null);
    setFilledRole('customer');
  };

  const handleAdminFill = () => {
    setEmailId('admin@cartify.com');
    setPassword('admin123');
    setErrorMessage(null);
    setFilledRole('admin');
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

        {notice && (
          <div
            className="alert-banner info"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'var(--info-bg)',
              color: 'var(--info-text)',
              border: '1px solid var(--info-border)',
              fontSize: '13px',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            <LockSimple size={16} weight="bold" />
            <span>{notice}</span>
          </div>
        )}

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
              onChange={(e) => {
                setEmailId(e.target.value);
                setFilledRole(null);
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setFilledRole(null);
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting}
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Authenticating...' : returnTarget ? 'Sign In & Continue to Checkout' : 'Sign In'}
          </button>

          {/* Quick Demo Credentials in Refined Minimalist UI */}
          <div className="auth-divider">
            <span>Quick Demo Credentials</span>
          </div>

          <div className="demo-accounts-container">
            {/* Fill Customer Card */}
            <button
              type="button"
              className={`demo-account-card ${filledRole === 'customer' ? 'active' : ''}`}
              onClick={handleDemoFill}
              title="Click to fill Customer credentials (shonlyforstudies@gmail.com / demo123)"
            >
              <div className="demo-account-icon customer">
                <User size={18} weight="bold" />
              </div>

              <div className="demo-account-content">
                <div className="demo-account-top">
                  <span className="demo-account-role">Fill Customer</span>
                  <span className={`demo-account-badge ${filledRole === 'customer' ? 'filled-badge' : ''}`}>
                    {filledRole === 'customer' ? (
                      <>
                        <Check size={11} weight="bold" />
                        <span>Filled</span>
                      </>
                    ) : (
                      'Auto-fill'
                    )}
                  </span>
                </div>
                <div className="demo-account-details">
                  <span className="demo-email">shonlyforstudies@gmail.com</span>
                  <span className="demo-dot">&middot;</span>
                  <span className="demo-pass">demo123</span>
                </div>
              </div>
            </button>

            {/* Fill Admin Card */}
            <button
              type="button"
              className={`demo-account-card ${filledRole === 'admin' ? 'active' : ''}`}
              onClick={handleAdminFill}
              title="Click to fill Admin credentials (admin@cartify.com / admin123)"
            >
              <div className="demo-account-icon admin">
                <ShieldCheck size={18} weight="fill" />
              </div>

              <div className="demo-account-content">
                <div className="demo-account-top">
                  <span className="demo-account-role">Fill Admin</span>
                  <span className={`demo-account-badge admin-badge ${filledRole === 'admin' ? 'filled-badge' : ''}`}>
                    {filledRole === 'admin' ? (
                      <>
                        <Check size={11} weight="bold" />
                        <span>Filled</span>
                      </>
                    ) : (
                      'Auto-fill'
                    )}
                  </span>
                </div>
                <div className="demo-account-details">
                  <span className="demo-email">admin@cartify.com</span>
                  <span className="demo-dot">&middot;</span>
                  <span className="demo-pass">admin123</span>
                </div>
              </div>
            </button>
          </div>
        </form>

        <div className="auth-footer">
          New to Cartify?
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigateToRegister(returnTarget, notice)}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
