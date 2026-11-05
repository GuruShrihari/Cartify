import { useState } from 'react';

function UserProfileManagement({ user, onUpdateUser, onAccountDeleted }) {
  const [putData, setPutData] = useState({
    username: user?.username || '',
    age: user?.age || '',
    password: '',
  });

  const [patchField, setPatchField] = useState('username');
  const [patchValue, setPatchValue] = useState('');

  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExecutePut = async (e) => {
    e.preventDefault();
    if (!putData.username.trim() || !putData.age || !putData.password) {
      setStatusType('error');
      setStatusMessage('Complete details (username, age, and password) are required.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/users?emailId=${encodeURIComponent(user.emailId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: putData.username.trim(),
          age: Number(putData.age),
          password: putData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusType('error');
        setStatusMessage(data.message || 'Failed to update profile.');
      } else {
        setStatusType('success');
        setStatusMessage(data.message || `Profile completely updated for ${data.user?.username || putData.username}.`);
        if (data.user) {
          onUpdateUser(data.user);
        }
        setPutData((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(`Request failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecutePatch = async (e) => {
    e.preventDefault();
    if (!patchValue.trim()) {
      setStatusType('error');
      setStatusMessage(`Please provide a new value for ${patchField}.`);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const bodyPayload = {};
      if (patchField === 'age') {
        bodyPayload.age = Number(patchValue);
      } else {
        bodyPayload[patchField] = patchValue.trim();
      }

      const response = await fetch(`/api/users?emailId=${encodeURIComponent(user.emailId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusType('error');
        setStatusMessage(data.message || `Failed to update ${patchField}.`);
      } else {
        setStatusType('success');
        setStatusMessage(data.message || `Successfully updated ${patchField}.`);
        if (data.user) {
          onUpdateUser(data.user);
          if (patchField === 'username') setPutData((prev) => ({ ...prev, username: data.user.username }));
          if (patchField === 'age') setPutData((prev) => ({ ...prev, age: data.user.age }));
        }
        setPatchValue('');
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(`Request failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete your registration record (${user.emailId})?`
    );
    if (!confirmDelete) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/users?emailId=${encodeURIComponent(user.emailId)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusType('error');
        setStatusMessage(data.message || 'Failed to delete account.');
      } else {
        alert(data.message || 'Account successfully deleted.');
        onAccountDeleted();
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage(`Request failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">User Profile Management</h2>
          <p className="page-subtitle">
            Manage your personal credentials, contact details, and account settings
          </p>
        </div>

        <div className="user-badge">
          Current User: <strong>{user?.username}</strong> &nbsp;({user?.emailId}) &bull; Age: {user?.age}
        </div>
      </div>

      {statusMessage && (
        <div className={`alert-banner ${statusType}`}>
          <span>
            {statusType === 'success' && '✓ '}
            {statusType === 'error' && '✗ '}
            {statusMessage}
          </span>
          <button
            type="button"
            className="btn"
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
            onClick={() => setStatusMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="profile-grid">
        <section className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Update Complete Details</h3>
            <p className="profile-card-desc">
              Update all profile attributes including username, age, and password.
            </p>
          </div>

          <form onSubmit={handleExecutePut} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="put-username">New Username</label>
              <input
                id="put-username"
                type="text"
                className="text-input"
                placeholder="Enter username"
                value={putData.username}
                onChange={(e) => setPutData({ ...putData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="put-age">New Age</label>
              <input
                id="put-age"
                type="number"
                min="1"
                max="120"
                className="text-input"
                placeholder="Enter age"
                value={putData.age}
                onChange={(e) => setPutData({ ...putData, age: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="put-password">New Password</label>
              <input
                id="put-password"
                type="password"
                className="text-input"
                placeholder="Enter new password"
                value={putData.password}
                onChange={(e) => setPutData({ ...putData, password: e.target.value })}
                required
              />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-solid btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update All Details'}
              </button>
            </div>
          </form>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Update Selected Details</h3>
            <p className="profile-card-desc">
              Quickly update a single attribute without altering other fields.
            </p>
          </div>

          <form onSubmit={handleExecutePatch} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="patch-field">Select Field to Update</label>
              <select
                id="patch-field"
                className="select-input"
                value={patchField}
                onChange={(e) => {
                  setPatchField(e.target.value);
                  setPatchValue('');
                }}
              >
                <option value="username">Username (Name)</option>
                <option value="age">Age</option>
                <option value="password">Password</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="patch-value">
                New Value for {patchField.toUpperCase()}
              </label>
              <input
                id="patch-value"
                type={patchField === 'age' ? 'number' : patchField === 'password' ? 'password' : 'text'}
                className="text-input"
                placeholder={`Enter new ${patchField}`}
                value={patchValue}
                onChange={(e) => setPatchValue(e.target.value)}
                required
              />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <button
                type="submit"
                className="btn btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : `Update Selected Field`}
              </button>
            </div>
          </form>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Delete Account</h3>
            <p className="profile-card-desc">
              Permanently removes your user registration record and account data.
            </p>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="warning-box">
              <strong>Account: {user?.emailId}</strong>
              Once deleted, your account cannot be recovered until you register again.
            </div>

            <div>
              <button
                type="button"
                className="btn btn-danger btn-block"
                onClick={handleExecuteDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default UserProfileManagement;
