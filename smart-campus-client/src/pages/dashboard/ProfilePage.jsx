import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { userApi } from '../../api/userApi';
import { formatDateTime } from '../../components/utils/dateUtils';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [prefs, setPrefs] = useState({
    notificationBookingEnabled: user?.notificationBookingEnabled ?? true,
    notificationTicketEnabled: user?.notificationTicketEnabled ?? true,
    notificationCommentEnabled: user?.notificationCommentEnabled ?? true,
    notificationEmailEnabled: user?.notificationEmailEnabled ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await userApi.updateNotificationPreferences(prefs);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-avatar-section">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} className="profile-avatar" />
              : <div className="profile-avatar-fallback">{user?.name?.charAt(0)}</div>
            }
            <div className="profile-badge-row">
              {user?.roles?.map((r) => (
                <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>
              ))}
            </div>
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              <span>🔐 {user?.oauthProvider || 'Google'} account</span>
              <span>📅 Joined {formatDateTime(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card">
          <h3 className="card-title">🔔 Notification Preferences</h3>
          <p className="card-subtitle">Choose which notifications you want to receive</p>

          <div className="prefs-list">
            {[
              { key: 'notificationBookingEnabled', label: 'Booking notifications', icon: '📅', desc: 'Approvals, rejections, cancellations' },
              { key: 'notificationTicketEnabled', label: 'Ticket notifications', icon: '🔧', desc: 'Status updates and assignments' },
              { key: 'notificationCommentEnabled', label: 'Comment notifications', icon: '💬', desc: 'New comments on your tickets' },
              { key: 'notificationEmailEnabled', label: 'Email notifications', icon: '📧', desc: 'Receive notifications via email' },
            ].map(({ key, label, icon, desc }) => (
              <div key={key} className="pref-item">
                <div className="pref-info">
                  <span className="pref-icon">{icon}</span>
                  <div>
                    <p className="pref-label">{label}</p>
                    <p className="pref-desc">{desc}</p>
                  </div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          <div className="card-footer">
            {saved && <span className="save-success">✅ Preferences saved!</span>}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
