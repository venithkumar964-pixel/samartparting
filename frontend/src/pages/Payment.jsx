import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { getErrorMessage } from '../services/api';

const methods = [
  { id: 'UPI', label: 'UPI' },
  { id: 'Card', label: 'Card' },
  { id: 'Cash', label: 'Cash' },
];

export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load booking.'));
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) load();
  }, [bookingId]);

  async function payNow() {
    setPaying(true);
    try {
      await api.post('/payments', { booking_id: booking.id, paymentMethod: method });
      navigate(`/confirmation?bookingId=${booking.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Payment failed. Please try again.'));
      setPaying(false);
    }
  }

  if (loading) return (<><Navbar /><div className="loader section page-top">Loading payment details…</div><Footer /></>);
  if (error) return (<><Navbar /><div className="section page-top container"><div className="alert alert-error">{error}</div></div><Footer /></>);

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Payment</span>
            <h2>Complete Your Payment</h2>
          </div>

          <div className="booking-layout">
            <div className="booking-form">
              <h3 className="block-title">Choose Payment Method</h3>
              <div className="payment-methods">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`payment-method ${method === m.id ? 'payment-method-active' : ''}`}
                    onClick={() => setMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {method === 'UPI' && (
                <div className="form-group">
                  <label htmlFor="upiId">UPI ID</label>
                  <input id="upiId" type="text" placeholder="yourname@upi" />
                </div>
              )}
              {method === 'Card' && (
                <div className="form-row split-row">
                  <div className="form-group">
                    <label htmlFor="cardNo">Card Number</label>
                    <input id="cardNo" type="text" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cardExp">Expiry / CVV</label>
                    <input id="cardExp" type="text" placeholder="12/28 · 123" />
                  </div>
                </div>
              )}
              {method === 'Cash' && (
                <p className="form-note">
                  You will pay at the parking entrance. The booking is still confirmed.
                </p>
              )}

              {error && <div className="alert alert-error">{error}</div>}

              <button type="button" className="button button-primary form-submit" disabled={paying} onClick={payNow}>
                {paying ? 'Processing Payment…' : `Pay ₹${booking.amount} via ${method}`}
              </button>
              <p className="form-note">
                This is a simulated payment for the college project demo — no real money is charged.
              </p>
            </div>

            <aside className="summary-card">
              <h3>Booking Summary</h3>
              <div className="summary-row"><span>Booking ID</span><span>#{booking.id}</span></div>
              <div className="summary-row"><span>Location</span><span>{booking.parkingName}</span></div>
              <div className="summary-row"><span>Slot</span><span>{booking.slotNumber}</span></div>
              <div className="summary-row"><span>Date</span><span>{booking.bookingDate}</span></div>
              <div className="summary-row"><span>Time</span><span>{booking.startTime} — {booking.endTime}</span></div>
              <div className="summary-row"><span>Duration</span><span>{booking.duration} h</span></div>
              <div className="summary-total"><span>Amount</span><span>₹{booking.amount}</span></div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}