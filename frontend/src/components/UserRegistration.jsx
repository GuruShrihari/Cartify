import React, { useState } from 'react';

function UserRegistration({ onNavigateToLogin }) {
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
        <div className="auth-header">
          <h2 className="page-title">Create an Account</h2>
          <p className="page-subtitle">Join Cartify for seamless shopping and order management</p>
        </div>

        {statusMessage && (
          <div className={`alert-banner ${isError ? 'error' : 'success'}`}>
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              name="username"
              className="text-input"
              placeholder="e.g. Raghavendra"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email ID</label>
            <input
              id="reg-email"
              type="email"
              name="emailId"
              className="text-input"
              placeholder="e.g. raghavendra@snu.edu.in"
              value={formData.emailId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-age">Age</label>
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
            <label className="form-label" htmlFor="reg-password">Password</label>
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
            className="btn btn-solid btn-block"
            disabled={isSubmitting}
            style={{ marginTop: '10px' }}
          >
            {isSubmitting ? 'Registering...' : 'Register User'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?
          <button
            type="button"
            className="auth-link"
            onClick={onNavigateToLogin}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserRegistration;
