import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  // Initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg2)', border: '0.5px solid var(--border)',
      borderRadius: '12px', padding: '11px 18px', marginBottom: '24px',
    }}>
      {/* Logo */}
      <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--pink)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-link" aria-hidden="true" />
        LinkSnap
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 20 }}>
        <Link
          to="/dashboard"
          style={{
            fontSize: 13, textDecoration: 'none',
            color: location.pathname === '/dashboard' ? 'var(--pink)' : 'var(--text2)',
          }}
        >
          Dashboard
        </Link>
      </div>

      {/* User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {user && (
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{user.email}</span>
        )}
        {/* Avatar */}
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'rgba(212,83,126,0.18)', border: '0.5px solid rgba(212,83,126,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 500, color: 'var(--pink)',
        }}>
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="ls-btn-secondary"
          style={{ padding: '5px 12px', fontSize: 12 }}
        >
          <i className="ti ti-logout" aria-hidden="true" style={{ fontSize: 13 }} />
          Logout
        </button>
      </div>
    </nav>
  );
}
