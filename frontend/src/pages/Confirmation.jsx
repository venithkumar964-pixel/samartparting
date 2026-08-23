import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { getErrorMessage } from '../services/api';

export default function Confirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load booking confirmation.'));
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) load();
  }, [bookingId]);

  if (loading) return (<><Navbar /><div className="loader section page-top">Loading confirmation…</div><Footer /></>);
  if (error) return (<><Navbar /><div className="section page-top container"><div className="alert alert-error">{error}</div></div><Footer /></>);

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container confirmation-wrap">
          <div className="confirmation-card">
            <div className="confirmation-tick">✓</div>
            <h2>Booking Successful!</h2>
            <p className="confirmation-sub">
              Your parking slot has been confirmed. Show the QR code below at the entrance.
            </p>

            <div className="qr-placeholder">
              <div className="qr-box">
                {/* Placeholder: a real QR can be generated from the booking id */}
                QR
              </div>
              <p>Booking #{booking.id}</p>
            </div>

            <div className="confirmation-details">
              <div className="summary-row"><span>Parking Location</span><span>{booking.parkingName}</span></div>
              <div className="summary-row"><span>Slot</span><span>{booking.slotNumber}</span></div>
              <div className="summary-row"><span>Date</span><span>{booking.bookingDate}</span></div>
              <div className="summary-row"><span>Time</span><span>{booking.startTime} — {booking.endTime}</span></div>
              <div className="summary-row"><span>Duration</span><span>{booking.duration} h</span></div>
              <div className="summary-row"><span>Amount</span><span>₹{booking.amount}</span></div>
              <div className="summary-total">
                <span>Payment Status</span>
                <span className={`badge ${booking.paymentStatus === 'paid' ? 'badge-paid' : 'badge-failed'}`}>
                  {booking.paymentStatus || 'pending'}
                </span>
              </div>
            </div>

            <Link to="/my-bookings" className="button button-primary form-submit">
              View My Bookings
            </Link>
            <button type="button" className="button button-secondary form-submit" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}