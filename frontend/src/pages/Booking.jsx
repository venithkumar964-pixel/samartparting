import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { getErrorMessage, getStoredUser } from '../services/api';

const timeOptions = [];
for (let h = 0; h < 24; h += 1) {
  for (const m of [0, 30]) {
    timeOptions.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const today = new Date().toISOString().split('T')[0];

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parkingId = searchParams.get('parkingId');
  const slotId = searchParams.get('slotId');

  const user = getStoredUser();

  const [parking, setParking] = useState(null);
  const [slot, setSlot] = useState(null);
  const [bookingDate, setBookingDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [parkingRes, slotsRes] = await Promise.all([
          api.get(`/parking/${parkingId}`),
          api.get(`/parking/${parkingId}/slots`),
        ]);
        setParking(parkingRes.data.parking);
        const found = slotsRes.data.slots.find((s) => String(s.id) === String(slotId));
        if (!found) throw new Error('Slot not found.');
        setSlot(found);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load booking details.'));
      } finally {
        setLoading(false);
      }
    }
    if (parkingId && slotId) load();
  }, [parkingId, slotId]);

  // Fee preview is computed on the client and also recomputed by the backend.
  const summary = useMemo(() => {
    if (!parking || !slot) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const minutes = (eh * 60 + em) - (sh * 60 + sm);
    if (minutes <= 0) return { valid: false, duration: 0, amount: 0 };
    const duration = minutes / 60;
    return {
      valid: true,
      duration,
      amount: Math.round(duration * parking.pricePerHour * 100) / 100,
    };
  }, [parking, slot, startTime, endTime]);

  async function confirmBooking() {
    if (!summary?.valid) {
      setMessage({ text: 'End time must be after start time.', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        user_id: user.id,
        parking_id: parking.id,
        slot_id: slot.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
      });
      navigate(`/payment?bookingId=${res.data.booking.id}`);
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Could not create booking.'), type: 'error' });
      setSubmitting(false);
    }
  }

  if (loading) return (<><Navbar /><div className="loader section page-top">Loading booking details…</div><Footer /></>);
  if (error) return (<><Navbar /><div className="section page-top container"><div className="alert alert-error">{error}</div></div><Footer /></>);

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Book a Slot</span>
            <h2>Confirm Your Booking</h2>
          </div>

          <div className="booking-layout">
            <div className="booking-form">
              <div className="form-group">
                <label>Parking Location</label>
                <input value={parking.name} disabled />
              </div>

              <div className="form-group">
                <label>Slot Number</label>
                <input value={`${slot.slotNumber} (${slot.slotType.toUpperCase()})`} disabled />
              </div>

              <div className="form-group">
                <label htmlFor="bookingDate">Date</label>
                <input
                  id="bookingDate"
                  type="date"
                  min={today}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div className="form-row split-row">
                <div className="form-group">
                  <label htmlFor="startTime">Start Time</label>
                  <select id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                    {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="endTime">End Time</label>
                  <select id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                    {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="button"
                className="button button-primary form-submit"
                disabled={submitting}
                onClick={confirmBooking}
              >
                {submitting ? 'Creating Booking…' : 'Confirm Booking'}
              </button>
            </div>

            <aside className="summary-card">
              <h3>Booking Summary</h3>
              <div className="summary-row"><span>Location</span><span>{parking.name}</span></div>
              <div className="summary-row"><span>Slot</span><span>{slot.slotNumber} · {slot.slotType.toUpperCase()}</span></div>
              <div className="summary-row"><span>Date</span><span>{bookingDate}</span></div>
              <div className="summary-row"><span>Time</span><span>{startTime} — {endTime}</span></div>
              <div className="summary-row"><span>Rate</span><span>₹{parking.pricePerHour}/hour</span></div>
              <div className="summary-row">
                <span>Duration</span>
                <span>{summary?.valid ? `${summary.duration} h` : '—'}</span>
              </div>
              <div className="summary-total">
                <span>Parking Fee</span>
                <span>₹{summary?.valid ? summary.amount : '—'}</span>
              </div>
              <p className="summary-note">
                Note: The slot is reserved only after you confirm. Continue to payment to
                finalize your booking.
              </p>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}