import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { getErrorMessage } from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.bookings);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load bookings.'));
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id) {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setMessage({ text: '', type: '' });
    try {
      await api.put(`/bookings/${id}`, { status: 'cancelled' });
      setMessage({ text: 'Booking cancelled successfully.', type: 'success' });
      loadBookings();
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Could not cancel booking.'), type: 'error' });
    }
  }

  function activeBookings() {
    return bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  }
  function completedBookings() {
    return bookings.filter((b) => b.status === 'completed');
  }
  function cancelledBookings() {
    return bookings.filter((b) => b.status === 'cancelled');
  }
  function canCancel(booking) {
    return booking.status === 'pending' || booking.status === 'confirmed';
  }

  function renderBooking(booking) {
    return (
      <article key={booking.id} className="booking-card">
        <div className="booking-card-head">
          <div>
            <span className="booking-id">Booking #{booking.id}</span>
            <h3>{booking.parkingName}</h3>
            <p>{booking.parkingAddress}</p>
          </div>
          <span className={`status-badge badge-status-${booking.status}`}>{booking.status}</span>
        </div>

        <div className="booking-card-grid">
          <div><span className="stat-label">Slot</span><b>{booking.slotNumber}</b></div>
          <div><span className="stat-label">Date</span><b>{booking.bookingDate}</b></div>
          <div><span className="stat-label">Time</span><b>{booking.startTime} — {booking.endTime}</b></div>
          <div><span className="stat-label">Duration</span><b>{booking.duration} h</b></div>
        </div>

        <div className="booking-card-foot">
          <div className="booking-amount">
            <span className="stat-label">Amount</span>
            <b>₹{booking.amount}</b>
            <span className={`badge ${booking.paymentStatus === 'paid' ? 'badge-paid' : 'badge-failed'}`}>
              {booking.paymentStatus || 'unpaid'}
            </span>
          </div>
          {canCancel(booking) && (
            <button type="button" className="button button-danger" onClick={() => cancelBooking(booking.id)}>
              Cancel Booking
            </button>
          )}
        </div>
      </article>
    );
  }

  function section(title, list) {
    if (list.length === 0) return null;
    return (
      <section className="bookings-section">
        <h3 className="block-title">{title}</h3>
        <div className="booking-list">{list.map(renderBooking)}</div>
      </section>
    );
  }

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Your Parking</span>
            <h2>My Bookings</h2>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="loader">Loading bookings…</div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="alert alert-info">
              You have no bookings yet.{' '}
              <a href="/parking" className="text-link">Find a parking spot now.</a>
            </div>
          ) : (
            <>
              {section('Upcoming Bookings', activeBookings())}
              {section('Completed Bookings', completedBookings())}
              {section('Cancelled Bookings', cancelledBookings())}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}