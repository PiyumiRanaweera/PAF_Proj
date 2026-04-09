import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

/**
 * Login Page Component
 * 
 * Provides two authentication portals:
 * - Student Portal: OAuth2 (Google Sign-In)
 * - Admin/Staff Portal: Email + Password authentication
 * 
 * @component
 */
const LoginPage = () => {
  const { user, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Admin login form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OAuth error from URL
  const error = new URLSearchParams(location.search).get('error');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  /**
   * Handle admin login form submission
   */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError('Email and password are required');
      return;
    }

    if (!adminEmail.includes('@')) {
      setAdminError('Please enter a valid email address');
      return;
    }

    if (adminPassword.length < 6) {
      setAdminError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setAdminError('');
      
      // Call admin login API
      const response = await authApi.adminLogin({
        email: adminEmail,
        password: adminPassword,
      });

      // Store token and user data
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccessMessage('✅ Login successful! Redirecting...');
      
      // Auto-redirect after brief delay
      await loginWithToken(response.data.accessToken);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      const apiError = err.response?.data?.message || err.message;
      setAdminError(`❌ ${apiError || 'Login failed. Please check your credentials.'}`);
      setAdminPassword(''); // Clear password on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-login-layout">
      {/* Animated Background */}
      <div className="login-bg-animated">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo-premium">🎓</div>
          <h1 className="login-title-premium">Smart Campus Operations Hub</h1>
          <p className="login-subtitle-premium">Intelligent campus management platform</p>
          
          {/* OAuth Error Alert */}
          {error && (
            <div className="alert alert-error" role="alert">
              ❌ {error === 'auth_failed' ? 'Authentication failed. Please try again.' : 'Sign-in was cancelled.'}
            </div>
          )}
        </div>

        {/* Login Portals */}
        <div className="portals-wrapper">
          {/* ==================== STUDENT PORTAL ==================== */}
          <div className="portal-card student-portal">
            <div className="portal-badge">Student</div>
            <div className="portal-icon">🎒</div>
            
            <h2 className="portal-title">Student Portal</h2>
            <p className="portal-description">
              Access your dashboard, book resources, and view notifications.
            </p>

            <div className="portal-features">
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Resource Booking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔔</span>
                <span>Notifications</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👤</span>
                <span>Profile Management</span>
              </div>
            </div>

            <button
              className="btn-oauth google-btn-premium"
              onClick={() => window.location.href = `${API_BASE_URL}/oauth2/authorize/google`}
              title="Sign in with your university Google account"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            <p className="portal-note">
              🔒 Uses university Google accounts for secure authentication
            </p>
          </div>

          {/* ==================== ADMIN PORTAL ==================== */}
          <div className="portal-card admin-portal">
            <div className="portal-badge admin-badge">Admin</div>
            <div className="portal-icon admin-icon">💼</div>
            
            <h2 className="portal-title">Staff & Admin Portal</h2>
            <p className="portal-description">
              Manage users, resources, bookings, and system settings.
            </p>

            <div className="portal-features">
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>User Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚙️</span>
                <span>System Settings</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Analytics</span>
              </div>
            </div>

            {/* Admin Login Form */}
            <form className="admin-login-form" onSubmit={handleAdminLogin}>
              {/* Admin Error Alert */}
              {adminError && (
                <div className="alert alert-error" role="alert">
                  {adminError}
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="admin-email" className="form-label">
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@smartcampus.edu"
                  className="form-input"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    setAdminError('');
                  }}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="admin-password" className="form-label">
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="form-input password-input"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setAdminError('');
                    }}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-admin-login"
                disabled={loading || !adminEmail || !adminPassword}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>🔐 Secure Login</>
                )}
              </button>

              {/* Demo Credentials Hint */}
              <div className="demo-hint">
                <p className="hint-text">
                  💡 Demo: Use <code>admin@smartcampus.edu</code>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p className="footer-text">
            🔒 Secure authentication • Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
