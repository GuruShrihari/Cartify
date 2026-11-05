import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, LockSimple } from '@phosphor-icons/react';

function UserRegistration({ onRegisterSuccess, onNavigateToLogin, onCancel }) {
  const location = useLocation();
  const returnTarget = location.state?.from || null;
  const notice = location.state?.notice || null;

  const [formData, setFormData] = useState({
    username: '',
    emailId: '',
    age: '',
    password: '',
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsError(false);

    if (!formData.username.trim() || !formData.emailId.trim() || !formData.age || !formData.password) {
      setIsError(true);
      setStatusMessage('Please fill in all registration fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          emailId: formData.emailId.trim(),
          age: Number(formData.age),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsError(true);
        setStatusMessage(data.message || 'Registration failed. Please check your inputs.');
      } else {
        setIsError(false);
        setStatusMessage(data.message || `Successfully registered! Welcome, ${formData.username}.`);
        setFormData({
          username: '',
          emailId: '',
          age: '',
          password: '',
        });

        if (data.token && onRegisterSuccess) {
          setTimeout(() => {
            onRegisterSuccess(
              {
                user: data.user,
                token: data.token,
              },
              returnTarget
            );
          }, 600);
        } else if (onNavigateToLogin) {
          setTimeout(() => {
            onNavigateToLogin(returnTarget);
          }, 800);
        }
      }
    } catch (err) {
      setIsError(true);
      setStatusMessage('Network or server error during registration: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
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
          <h2 className="page-title">Create an Account</h2>
          <p className="page-subtitle">
            Join Cartify for seamless shopping, order tracking and member deals
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

        {statusMessage && (
          <div className={`alert-banner ${isError ? 'error' : 'success'}`}>
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">
              Username
            </label>
            <input
              id="reg-username"
              type="text"
              name="username"
              className="text-input"
              placeholder="e.g. AlexMorgan"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email ID
            </label>
            <input
              id="reg-email"
              type="email"
              name="emailId"
              className="text-input"
              placeholder="name@example.com"
              value={formData.emailId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-age">
              Age
            </label>
            <input
              id="reg-age"
              type="number"
              name="age"
              min="1"
              max="120"
              className="text-input"
              placeholder="e.g. 21"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              className="text-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting}
            style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Registering...' : returnTarget ? 'Create Account & Continue to Checkout' : 'Register User'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?
          <button
            type="button"
            className="auth-link"
            onClick={() => onNavigateToLogin(returnTarget, notice)}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserRegistration;
