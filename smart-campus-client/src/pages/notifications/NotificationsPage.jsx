import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../components/utils/dateUtils';

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅', BOOKING_REJECTED: '❌', BOOKING_CANCELLED: '🚫',
  BOOKING_PENDING: '⏳', TICKET_STATUS_UPDATED: '🔧', TICKET_ASSIGNED: '👷',
  TICKET_RESOLVED: '✔️', TICKET_REJECTED: '❌', NEW_COMMENT: '💬',
  ROLE_CHANGED: '🔑', SYSTEM_ANNOUNCEMENT: '📢',
};

const TYPE_LABELS = {
  BOOKING_APPROVED: 'Booking', BOOKING_REJECTED: 'Booking', BOOKING_CANCELLED: 'Booking',
  BOOKING_PENDING: 'Booking', TICKET_STATUS_UPDATED: 'Ticket', TICKET_ASSIGNED: 'Ticket',
  TICKET_RESOLVED: 'Ticket', TICKET_REJECTED: 'Ticket', NEW_COMMENT: 'Comment',
  ROLE_CHANGED: 'Account', SYSTEM_ANNOUNCEMENT: 'System',
};

const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [filter, setFilter] = useState('ALL');

  const filters = ['ALL', 'UNREAD', 'BOOKING', 'TICKET', 'COMMENT'];

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.isRead;
    return TYPE_LABELS[n.type] === filter.charAt(0) + filter.slice(1).toLowerCase();
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated on all your campus activities</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            ✓ Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {filters.map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'UNREAD' && unreadCount > 0 ? `Unread (${unreadCount})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="notif-full-list">
        {loading && <div className="loading-spinner"><div className="spinner" /></div>}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>You're all caught up! Check back later.</p>
          </div>
        )}
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className={`notif-full-item ${!notif.isRead ? 'unread' : ''}`}
          >
            <div className="notif-full-icon">{TYPE_ICONS[notif.type] || '📌'}</div>
            <div className="notif-full-body">
              <div className="notif-full-meta">
                <span className="notif-type-chip">{TYPE_LABELS[notif.type] || 'System'}</span>
                <span className="notif-full-time">{formatDateTime(notif.createdAt)}</span>
                {!notif.isRead && <span className="unread-dot" />}
              </div>
              <h4 className="notif-full-title">{notif.title}</h4>
              <p className="notif-full-msg">{notif.message}</p>
            </div>
            <div className="notif-full-actions">
              {!notif.isRead && (
                <button className="btn-icon-sm" title="Mark as read" onClick={() => markAsRead(notif.id)}>✓</button>
              )}
              <button className="btn-icon-sm btn-danger-sm" title="Delete" onClick={() => deleteNotification(notif.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
