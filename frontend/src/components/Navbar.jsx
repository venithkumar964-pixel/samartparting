import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearStoredUser, getStoredUser, isLoggedIn } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  // '/' is the home page; About/Contact are sections of the home page.
  const navItems = [
    { label: 'Home', to: '/', end: true },
    { label: 'Parking', to: '/parking' },
    { label: 'About', to: '/#about' },
    { label: 'Contact', to: '/#contact' },
  ];

  function handleLogout() {
    clearStoredUser();
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          Smart<span className="brand-accent">Park</span>
        </Link>

        <nav className="main-nav">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} end={item.end}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {isLoggedIn() ? (
            <>
              <span className="nav-welcome">
                Hi, {(user && user.name ? user.name.split(' ')[0] : 'User')}
                {user && user.role === 'admin' ? ' (Admin)' : ''}
              </span>
              {user.role === 'admin' && (
                <Link to="/admin" className="button button-secondary">
                  Admin Dashboard
                </Link>
              )}
              <Link to="/my-bookings" className="button button-secondary">
                My Bookings
              </Link>
              <button type="button" className="button button-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="button button-secondary">
                Login
              </Link>
              <Link to="/register" className="button button-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}