import { useState } from 'react';
import {
  User,
  EnvelopeSimple,
  ShieldCheck,
  CheckCircle,
  Key,
  Calendar,
  LockSimple,
  Trash,
  Eye,
  EyeSlash,
  ArrowRight,
  PencilSimple,
  SlidersHorizontal,
  WarningOctagon,
  WarningCircle,
} from '@phosphor-icons/react';

function UserProfileManagement({
  user,
  onUpdateUser,
  onAccountDeleted,
  onNavigateToAdmin,
}) {
  const [activeTab, setActiveTab] = useState('full-update'); // 'full-update' | 'quick-patch' | 'security'

  // Full Update (PUT) Form State
  const [putData, setPutData] = useState({
    username: user?.username || '',
    age: user?.age || '',
    password: '',
  });
  const [showPutPassword, setShowPutPassword] = useState(false);

  // Quick Patch (PATCH) Form State
  const [patchField, setPatchField] = useState('username');
  const [patchValue, setPatchValue] = useState('');
  const [showPatchPassword, setShowPatchPassword] = useState(false);

  // UI Status State
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Compute initials for avatar monogram
  const userInitials = String(user?.username || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  // Handle Full Details Update (PUT)
  const handleExecutePut = async (e) => {
    e.preventDefault();
    if (!putData.username.trim() || !putData.age || !putData.password) {
      setStatusType('error');
      setStatusMessage('All fields (Username, Age, and Password) are required to update credentials.');
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
        setStatusMessage(data.message || `Profile successfully updated for ${data.user?.username || putData.username}.`);
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

  // Handle Single Field Update (PATCH)
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

  // Handle Account Deletion (DELETE)
  const handleExecuteDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete your account record (${user.emailId})?\n\nThis action cannot be undone.`
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
    <div className="profile-management-page">
      {/* =========================================================================
          HERO PROFILE OVERVIEW CARD
          ========================================================================= */}
      <div className="profile-hero-card">
        <div className="profile-hero-main">
          {/* Monogram Avatar */}
          <div className={`profile-avatar ${isAdmin ? 'admin-ring' : ''}`}>
            <span>{userInitials}</span>
            <span className="profile-status-online" title="Active session" />
          </div>

          {/* User Details & Identity */}
          <div className="profile-identity">
            <div className="profile-role-row">
              {isAdmin ? (
                <span className="profile-badge admin">
                  <ShieldCheck size={14} weight="fill" />
                  <span>Store Administrator &middot; Root Admin</span>
                </span>
              ) : (
                <span className="profile-badge customer">
                  <CheckCircle size={14} weight="fill" />
                  <span>Verified Customer Account</span>
                </span>
              )}
              <span className="profile-uid-pill">ID #{String(user?._id || user?.emailId || 'USR').slice(-6)}</span>
            </div>

            <h1 className="profile-user-name">{user?.username}</h1>

            <p className="profile-tagline">
              Manage your personal credentials, contact details, and account settings
            </p>

            {/* Quick Meta Pills */}
            <div className="profile-meta-pills">
              <div className="meta-pill" title="Registered Email">
                <EnvelopeSimple size={14} weight="bold" />
                <span>{user?.emailId}</span>
              </div>

              <div className="meta-pill" title="Age">
                <Calendar size={14} weight="bold" />
                <span>Age: <strong>{user?.age}</strong></span>
              </div>

              <div className="meta-pill" title="Security Status">
                <LockSimple size={14} weight="bold" />
                <span>Password Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action: Admin Shortcut if admin */}
        {isAdmin && onNavigateToAdmin && (
          <div className="profile-hero-action">
            <button
              type="button"
              className="btn-admin-portal-link"
              onClick={onNavigateToAdmin}
              title="Navigate to Store Admin Dashboard"
            >
              <ShieldCheck size={16} weight="fill" />
              <span>Open Admin Portal</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          STATUS NOTIFICATION BANNER
          ========================================================================= */}
      {statusMessage && (
        <div className={`alert-banner ${statusType}`} style={{ margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {statusType === 'success' && <CheckCircle size={16} weight="fill" />}
            {statusType === 'error' && <WarningCircle size={16} weight="fill" />}
            <span>{statusMessage}</span>
          </div>
          <button
            type="button"
            className="alert-dismiss-btn"
            onClick={() => setStatusMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          PROFILE NAVIGATION TABS
          ========================================================================= */}
      <div className="profile-nav-tabs">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'full-update' ? 'active' : ''}`}
          onClick={() => setActiveTab('full-update')}
        >
          <PencilSimple size={16} weight="regular" />
          <span>Full Profile Update</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'quick-patch' ? 'active' : ''}`}
          onClick={() => setActiveTab('quick-patch')}
        >
          <SlidersHorizontal size={16} weight="regular" />
          <span>Quick Field Editor</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={16} weight="regular" />
          <span>Security & Danger Zone</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: FULL PROFILE UPDATE (PUT)
          ========================================================================= */}
      {activeTab === 'full-update' && (
        <div className="profile-tab-content">
          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Update Complete Account Credentials</h2>
                <p className="section-card-desc">
                  Update your display username, age, and reset your login password simultaneously.
                </p>
              </div>
            </div>

            <form onSubmit={handleExecutePut} className="profile-form-grid">
              <div className="form-row-2">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="put-username">
                    <User size={14} weight="bold" />
                    <span>Display Username</span>
                  </label>
                  <input
                    id="put-username"
                    type="text"
                    className="text-input"
                    placeholder="Enter your name"
                    value={putData.username}
                    onChange={(e) => setPutData({ ...putData, username: e.target.value })}
                    required
                  />
                  <span className="field-hint">Visible across reviews, orders, and receipt confirmations.</span>
                </div>

                {/* Age */}
                <div className="form-group">
                  <label className="form-label" htmlFor="put-age">
                    <Calendar size={14} weight="bold" />
                    <span>Age</span>
                  </label>
                  <input
                    id="put-age"
                    type="number"
                    min="1"
                    max="120"
                    className="text-input"
                    placeholder="Enter your age"
                    value={putData.age}
                    onChange={(e) => setPutData({ ...putData, age: e.target.value })}
                    required
                  />
                  <span className="field-hint">Used for personalized collection recommendations.</span>
                </div>
              </div>

              <div className="form-row-2">
                {/* Email (Read-Only) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="put-email">
                    <EnvelopeSimple size={14} weight="bold" />
                    <span>Account Email Address</span>
                  </label>
                  <div className="readonly-input-wrap">
                    <input
                      id="put-email"
                      type="email"
                      className="text-input disabled"
                      value={user?.emailId || ''}
                      disabled
                      readOnly
                    />
                    <span className="verified-pill">Primary</span>
                  </div>
                  <span className="field-hint">Primary identifier linked to your Razorpay invoices and Resend receipts.</span>
                </div>

                {/* Password with Eye Toggle */}
                <div className="form-group">
                  <label className="form-label" htmlFor="put-password">
                    <Key size={14} weight="bold" />
                    <span>New Account Password</span>
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="put-password"
                      type={showPutPassword ? 'text' : 'password'}
                      className="text-input"
                      placeholder="Enter new password"
                      value={putData.password}
                      onChange={(e) => setPutData({ ...putData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPutPassword(!showPutPassword)}
                      title={showPutPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPutPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <span className="field-hint">Enter your new secure password to confirm this profile update.</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions-row">
                <button
                  type="submit"
                  className="btn-solid"
                  disabled={isSubmitting}
                  style={{ width: 'auto', padding: '0 28px' }}
                >
                  <PencilSimple size={16} weight="bold" />
                  <span>{isSubmitting ? 'Updating Credentials...' : 'Save All Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: QUICK ATTRIBUTE EDITOR (PATCH)
          ========================================================================= */}
      {activeTab === 'quick-patch' && (
        <div className="profile-tab-content">
          <div className="profile-section-card">
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Quick Attribute Editor</h2>
                <p className="section-card-desc">
                  Update an isolated profile attribute without modifying other credentials.
                </p>
              </div>
            </div>

            {/* Field Selector Pills */}
            <div className="patch-field-selector" role="radiogroup" aria-label="Field to update">
              <button
                type="button"
                className={`patch-pill-opt ${patchField === 'username' ? 'active' : ''}`}
                onClick={() => {
                  setPatchField('username');
                  setPatchValue('');
                }}
              >
                <User size={15} weight="bold" />
                <span>Display Name</span>
              </button>

              <button
                type="button"
                className={`patch-pill-opt ${patchField === 'age' ? 'active' : ''}`}
                onClick={() => {
                  setPatchField('age');
                  setPatchValue('');
                }}
              >
                <Calendar size={15} weight="bold" />
                <span>Age</span>
              </button>

              <button
                type="button"
                className={`patch-pill-opt ${patchField === 'password' ? 'active' : ''}`}
                onClick={() => {
                  setPatchField('password');
                  setPatchValue('');
                }}
              >
                <Key size={15} weight="bold" />
                <span>Password</span>
              </button>
            </div>

            <form onSubmit={handleExecutePatch} className="patch-form">
              <div className="form-group" style={{ maxWidth: '480px' }}>
                <label className="form-label" htmlFor="patch-input">
                  New value for {patchField === 'username' ? 'Display Name' : patchField === 'age' ? 'Age' : 'Password'}
                </label>

                {patchField === 'password' ? (
                  <div className="password-input-wrap">
                    <input
                      id="patch-input"
                      type={showPatchPassword ? 'text' : 'password'}
                      className="text-input"
                      placeholder="Enter new password"
                      value={patchValue}
                      onChange={(e) => setPatchValue(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPatchPassword(!showPatchPassword)}
                      title={showPatchPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPatchPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ) : (
                  <input
                    id="patch-input"
                    type={patchField === 'age' ? 'number' : 'text'}
                    min={patchField === 'age' ? '1' : undefined}
                    max={patchField === 'age' ? '120' : undefined}
                    className="text-input"
                    placeholder={`Enter new ${patchField}`}
                    value={patchValue}
                    onChange={(e) => setPatchValue(e.target.value)}
                    required
                  />
                )}
                <span className="field-hint">
                  Current: {patchField === 'username' ? user?.username : patchField === 'age' ? `${user?.age} years` : '••••••••'}
                </span>
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn-solid"
                  disabled={isSubmitting}
                  style={{ width: 'auto', padding: '0 24px' }}
                >
                  <PencilSimple size={15} weight="bold" />
                  <span>{isSubmitting ? 'Updating...' : `Update ${patchField.charAt(0).toUpperCase() + patchField.slice(1)}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SECURITY, PRIVACY & DANGER ZONE
          ========================================================================= */}
      {activeTab === 'security' && (
        <div className="profile-tab-content">
          {/* Security Overview Card */}
          <div className="profile-section-card" style={{ marginBottom: '24px' }}>
            <div className="section-card-header">
              <div>
                <h2 className="section-card-title">Security & Credentials Overview</h2>
                <p className="section-card-desc">
                  Authentication encryption and session security details for this account.
                </p>
              </div>
            </div>

            <div className="security-specs-grid">
              <div className="sec-item">
                <span className="sec-label">Authentication Token</span>
                <span className="sec-value">JWT Signed &middot; 24h Expiry</span>
              </div>

              <div className="sec-item">
                <span className="sec-label">Account Role</span>
                <span className="sec-value">
                  {isAdmin ? 'System Administrator (RBAC)' : 'Customer (Standard Access)'}
                </span>
              </div>

              <div className="sec-item">
                <span className="sec-label">Transaction Receipts</span>
                <span className="sec-value">Auto-dispatched by Resend API</span>
              </div>

              <div className="sec-item">
                <span className="sec-label">Payment Security</span>
                <span className="sec-value">Razorpay 256-bit Encrypted Checkout</span>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="profile-section-card danger-zone-card">
            <div className="danger-header">
              <div className="danger-icon-wrap">
                <WarningOctagon size={22} weight="fill" color="#dc2626" />
              </div>
              <div>
                <h3 className="danger-title">Delete Account &amp; Credentials</h3>
                <p className="danger-desc">
                  Permanently erase your user registration record ({user?.emailId}). Once deleted, your account cannot be recovered.
                </p>
              </div>
            </div>

            <div className="danger-actions">
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handleExecuteDelete}
                disabled={isSubmitting}
              >
                <Trash size={16} weight="bold" />
                <span>{isSubmitting ? 'Removing Account...' : 'Permanently Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfileManagement;
