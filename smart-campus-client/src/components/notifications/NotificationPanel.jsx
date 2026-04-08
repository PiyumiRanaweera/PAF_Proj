import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from '../utils/dateUtils';

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_CANCELLED: '🚫',
  BOOKING_PENDING: '⏳',
  TICKET_STATUS_UPDATED: '🔧',
  TICKET_ASSIGNED: '👷',
  TICKET_RESOLVED: '✔️',
  TICKET_REJECTED: '❌',
  NEW_COMMENT: '💬',
  ROLE_CHANGED: '🔑',
  SYSTEM_ANNOUNCEMENT: '📢',
};

const NotificationPanel = ({ onClose }) => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notif) => {
    if (!notif.isRead) markAsRead(notif.id);
    if (notif.referenceType === 'BOOKING') navigate(`/bookings/${notif.referenceId}`);
    else if (notif.referenceType === 'TICKET') navigate(`/tickets/${notif.referenceId}`);
    onClose();
  };

  const recent = notifications.slice(0, 8);

  return (
    <div className="notif-panel" id="notification-panel">
      {/* Header */}
      <div className="notif-panel-header">
        <h3 className="notif-panel-title">
          Notifications
          {unreadCount > 0 && <span className="notif-count-chip">{unreadCount} new</span>}
        </h3>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="notif-list">
        {loading && <div className="notif-loading">Loading...</div>}
        {!loading && recent.length === 0 && (
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <p>You're all caught up!</p>
          </div>
        )}
        {recent.map((notif) => (
          <div
            key={notif.id}
            className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
            onClick={() => handleClick(notif)}
          >
            <div className="notif-item-icon">{TYPE_ICONS[notif.type] || '📌'}</div>
            <div className="notif-item-body">
              <p className="notif-item-title">{notif.title}</p>
              <p className="notif-item-msg">{notif.message}</p>
              <span className="notif-item-time">
                {formatDistanceToNow(notif.createdAt)}
              </span>
            </div>
            <button
              className="notif-delete-btn"
              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notif-panel-footer">
          <button
            className="view-all-btn"
            onClick={() => { navigate('/notifications'); onClose(); }}
          >
            View all notifications →
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
