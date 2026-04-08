import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Welcome to the Smart Campus Operations Hub</p>
        </div>
        {unreadCount > 0 && (
          <div className="dashboard-alert">
            🔔 You have <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <DashCard icon="🏢" title="Resources" desc="Browse and search campus facilities" href="/resources" color="blue" />
        <DashCard icon="📅" title="My Bookings" desc="View and manage your room bookings" href="/bookings" color="purple" />
        <DashCard icon="🔧" title="Tickets" desc="Report and track maintenance issues" href="/tickets" color="orange" />
        <DashCard icon="🔔" title="Notifications" desc="Stay updated on your activities" href="/notifications" color="teal" badge={unreadCount} />
        <DashCard icon="👤" title="My Profile" desc="Update your account & preferences" href="/profile" color="pink" />
        {isAdmin() && <DashCard icon="👥" title="User Management" desc="Manage users & assign roles" href="/admin/users" color="red" />}
      </div>
    </div>
  );
};

const DashCard = ({ icon, title, desc, href, color, badge }) => (
  <a href={href} className={`dash-card dash-card-${color}`}>
    <div className="dash-card-icon">{icon}</div>
    <div className="dash-card-content">
      <h3 className="dash-card-title">{title}</h3>
      <p className="dash-card-desc">{desc}</p>
    </div>
    {badge > 0 && <span className="dash-card-badge">{badge}</span>}
    <span className="dash-card-arrow">→</span>
  </a>
);

export default DashboardPage;
