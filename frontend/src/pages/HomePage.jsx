import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sp_user');
    if (!stored) {
      navigate('/login', { replace: true });
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem('sp_user');
    navigate('/login', { replace: true });
  }

  if (!user) return null;

  return (
    <div className="home-page">
      <header className="topbar">
        <div className="container nav-container">
          <span className="brand">SmartPark</span>
          <div className="nav-actions">
            <span className="nav-welcome">Welcome, {user.fullName}</span>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy fade-in-up">
              <span className="eyebrow">Smart Parking Platform</span>
              <h1>Welcome, {user.fullName}!</h1>
              <p>
                You have successfully logged in. Enjoy a smarter parking
                experience with real-time availability and fast booking.
              </p>
              <div className="hero-buttons">
                <a href="/" className="button button-primary">
                  Find Parking
                </a>
              </div>
            </div>
            <div className="hero-image fade-in-up-delay-3">
              <img
                src="/images/parking-illustration.png"
                alt="Smart parking illustration"
              />
            </div>
          </div>
        </section>

        <section className="section feature-section">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">Your Account</span>
              <h2>Account Details</h2>
            </div>
            <div className="feature-grid">
              <article className="feature-card">
                <h3>Name</h3>
                <p>{user.fullName}</p>
              </article>
              <article className="feature-card">
                <h3>Email</h3>
                <p>{user.email}</p>
              </article>
              <article className="feature-card">
                <h3>Vehicle</h3>
                <p>
                  {user.vehicleNumber} ({user.vehicleType})
                </p>
              </article>
              <article className="feature-card">
                <h3>Phone</h3>
                <p>{user.phone}</p>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
