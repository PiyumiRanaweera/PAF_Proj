import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/auth/LoginPage';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import { useAuth } from './context/AuthContext';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>{children}</main>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppLayout>
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><AdminUsersPage /></ProtectedRoute>} />

              {/* Placeholder routes for other modules */}
              <Route path="/resources/*" element={<ProtectedRoute><PlaceholderPage title="Resources" icon="🏢" /></ProtectedRoute>} />
              <Route path="/bookings/*" element={<ProtectedRoute><PlaceholderPage title="Bookings" icon="📅" /></ProtectedRoute>} />
              <Route path="/tickets/*" element={<ProtectedRoute><PlaceholderPage title="Tickets" icon="🔧" /></ProtectedRoute>} />

              {/* Default */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const PlaceholderPage = ({ title, icon }) => (
  <div className="page">
    <div className="empty-state" style={{ marginTop: '4rem' }}>
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>This module is implemented by another team member. Integration coming soon.</p>
    </div>
  </div>
);

export default App;
