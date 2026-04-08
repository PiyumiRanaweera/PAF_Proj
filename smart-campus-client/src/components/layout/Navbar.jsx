import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../notifications/NotificationPanel';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/resources', label: 'Resources', icon: '🏢' },
    { to: '/bookings', label: 'Bookings', icon: '📅' },
    { to: '/tickets', label: 'Tickets', icon: '🔧' },
    ...(isAdmin() ? [{ to: '/admin/users', label: 'Users', icon: '👥' }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">Smart Campus</span>
        </Link>

        {/* Nav links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {/* Notification Bell */}
          <div className="notif-wrapper" ref={notifRef}>
            <button
              id="notification-bell-btn"
              className="icon-btn"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
            >
              <span className="bell-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* User avatar + menu */}
          <div className="user-menu-wrapper" ref={menuRef}>
            <button
              id="user-avatar-btn"
              className="avatar-btn"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
              ) : (
                <div className="avatar-fallback">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {menuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                  <div className="dropdown-roles">
                    {user?.roles?.map((r) => (
                      <span key={r} className={`role-badge role-${r.toLowerCase()}`}>{r}</span>
                    ))}
                  </div>
                </div>
                <div className="dropdown-divider" />
                <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  👤 My Profile
                </Link>
                <Link to="/notifications" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                  🔔 All Notifications
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
