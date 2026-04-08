import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Handles OAuth2 redirect — extracts JWT token from URL and logs user in
 * Route: /oauth2/redirect?token=xxx&userId=yyy
 */
const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      loginWithToken(token)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => navigate('/login?error=auth_failed', { replace: true }));
    } else {
      navigate('/login?error=no_token', { replace: true });
    }
  }, []);

  return (
    <div className="oauth-loading">
      <div className="spinner" />
      <p>Completing sign-in...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
