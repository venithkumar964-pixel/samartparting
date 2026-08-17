import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer app-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              Smart<span className="brand-accent">Park</span>
            </Link>
            <p>
              Find, book, and park hassle-free. Real-time parking availability
              with instant slot booking for cars, bikes, and EVs.
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/parking">Parking</Link>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/admin">Admin Dashboard</Link>
          </div>

          <div className="footer-links">
            <h4>Contact</h4>
            <Link to="mailto:support@smartpark.in">support@smartpark.in</Link>
            <Link to="tel:+919876543210">+91 98765 43210</Link>
            <Link to="/#about">About SmartPark</Link>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} SmartPark & Slot Booking Platform. College Project.
        </div>
      </div>
    </footer>
  );
}