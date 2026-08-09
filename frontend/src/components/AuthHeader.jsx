import { Link } from 'react-router-dom';

export default function AuthHeader({ altPage }) {
  const isLogin = altPage === 'login';

  return (
    <header className="auth-header">
      <div className="container auth-nav">
        <Link to="/" className="brand">SmartPark</Link>
        <nav className="auth-links">
          <Link to="/">Home</Link>
          {isLogin ? (
            <Link to="/login">Login</Link>
          ) : (
            <Link to="/register">Register</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
