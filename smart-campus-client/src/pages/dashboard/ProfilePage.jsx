import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/userApi';
import { formatDateTime } from '../../components/utils/dateUtils';

/**
 * ProfilePage Component
 * Allows users to view their profile information and manage notification preferences
 */
const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  
  // State management
  const [prefs, setPrefs] = useState({
    notificationBookingEnabled: user?.notificationBookingEnabled ?? true,
    notificationTicketEnabled: user?.notificationTicketEnabled ?? true,
    notificationCommentEnabled: user?.notificationCommentEnabled ?? true,
    notificationEmailEnabled: user?.notificationEmailEnabled ?? true,
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Notification preference items
  const notificationOptions = [
    { 
      key: 'notificationBookingEnabled', 
      label: 'Booking Notifications', 
      icon: '📅', 
      desc: 'Get notified about booking approvals, rejections, and cancellations' 
    },
    { 
      key: 'notificationTicketEnabled', 
      label: 'Ticket Notifications', 
      icon: '🔧', 
      desc: 'Receive updates on ticket status changes and assignments' 
    },
    { 
      key: 'notificationCommentEnabled', 
      label: 'Comment Notifications', 
      icon: '💬', 
      desc: 'Get notified when people comment on your tickets' 
    },
    { 
      key: 'notificationEmailEnabled', 
      label: 'Email Notifications', 
      icon: '📧', 
      desc: 'Receive all notifications via your email address' 
    },
  ];

  /**
   * Handle preference change
   */
  const handlePreferenceChange = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
    setError(null);
  };

  /**
   * Save notification preferences
   */
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const res = await userApi.updateNotificationPreferences(prefs);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      setSuccessMessage('✅ Preferences saved successfully!');
      setHasChanges(false);
      
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save preferences';
      setError(`❌ ${errorMsg}`);
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset preferences to original values
   */
  const handleReset = () => {
    setPrefs({
      notificationBookingEnabled: user?.notificationBookingEnabled ?? true,
      notificationTicketEnabled: user?.notificationTicketEnabled ?? true,
      notificationCommentEnabled: user?.notificationCommentEnabled ?? true,
      notificationEmailEnabled: user?.notificationEmailEnabled ?? true,
    });
    setHasChanges(false);
    setError(null);
  };

  // Guard against missing user data
  if (!user) {
    return (
      <div className="page">
        <div className="error-container">
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  const userInitial = user?.name?.charAt(0) || 'U';
  const userRole = user?.roles?.[0] || 'User';

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings and notification preferences</p>
      </div>

      <div className="profile-grid">
        {/* Profile Information Card */}
        <div className="card profile-card">
          <div className="profile-avatar-section">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name || 'User'} 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">{userInitial}</div>
            )}
            
            {/* User Roles */}
            {user?.roles && user.roles.length > 0 && (
              <div className="profile-badge-row">
                {user.roles.map((role) => (
                  <span 
                    key={role} 
                    className={`role-badge role-${role.toLowerCase()}`}
                    title={`Role: ${role}`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="profile-info">
            <h2 className="profile-name">{user?.name || 'Unknown User'}</h2>
            <p className="profile-email">{user?.email || 'No email provided'}</p>
            
            <div className="profile-meta">
              <div className="meta-item">
                <span className="meta-icon">🔐</span>
                <span>
                  {user?.oauthProvider 
                    ? `${user.oauthProvider.charAt(0).toUpperCase()}${user.oauthProvider.slice(1)} account` 
                    : 'Local account'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>
                  Joined {user?.createdAt ? formatDateTime(user.createdAt) : 'Unknown'}
                </span>
              </div>
              {user?.isActive !== undefined && (
                <div className="meta-item">
                  <span className="meta-icon">{user.isActive ? '✓' : '✗'}</span>
                  <span>
                    Status: {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="profile-actions">
            <button 
              className="btn btn-secondary"
              onClick={logout}
              title="Sign out from your account"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="card notifications-card">
          <div className="card-header">
            <h3 className="card-title">🔔 Notification Preferences</h3>
            <p className="card-subtitle">Choose which notifications you want to receive</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}

          {/* Notification Preferences List */}
          <div className="prefs-list">
            {notificationOptions.map(({ key, label, icon, desc }) => (
              <div 
                key={key} 
                className="pref-item"
                role="group"
                aria-label={label}
              >
                <div className="pref-info">
                  <span className="pref-icon" aria-hidden="true">{icon}</span>
                  <div>
                    <p className="pref-label">{label}</p>
                    <p className="pref-desc">{desc}</p>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={prefs[key] ?? true}
                    onChange={() => handlePreferenceChange(key)}
                    aria-label={`${label} toggle`}
                  />
                  <span className="toggle-slider" aria-hidden="true" />
                </label>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="card-footer">
            <div className="button-group">
              <button 
                className="btn btn-secondary" 
                onClick={handleReset}
                disabled={!hasChanges || saving}
                title="Discard changes"
              >
                Reset
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={!hasChanges || saving}
                title={hasChanges ? 'Save your notification preferences' : 'No changes to save'}
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
