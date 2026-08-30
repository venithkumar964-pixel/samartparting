import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="section page-top">
        <div className="container confirmation-wrap">
          <div className="confirmation-card">
            <h1 className="not-found-code">404</h1>
            <h2>Page Not Found</h2>
            <p className="confirmation-sub">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link to="/" className="button button-primary form-submit">
              Go to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}