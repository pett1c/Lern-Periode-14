import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, authWarning } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <header className={`wf-nav ${user?.role === 'admin' ? 'wf-nav-admin' : ''}`}>
        <Link to="/dashboard" className="wf-logo">
          event<em>ify</em>
        </Link>
        <nav className="nav-links">
          <NavLink className="pill p-ghost" to="/dashboard">Dashboard</NavLink>
          {user?.role === 'user' ? <NavLink className="pill p-ghost" to="/tickets">Tickets</NavLink> : null}
          <NavLink className="ai-btn" style={{ margin: 0, padding: '6px 12px', fontSize: '0.9rem' }} to="/chat"><span className="sparkle">✦</span> AI Assistant</NavLink>
          {(user?.role === 'organizer' || user?.role === 'admin') && (
            <NavLink className="pill p-ghost" to="/events/create">+ Event</NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink className="pill p-fill" to="/admin">Admin</NavLink>
          )}
          <button type="button" className="pill p-fill" onClick={onLogout}>
            {user?.name || 'User'} ▾
          </button>
        </nav>
      </header>
      {authWarning ? <p className="auth-warning">{authWarning}</p> : null}
    </>
  );
}
