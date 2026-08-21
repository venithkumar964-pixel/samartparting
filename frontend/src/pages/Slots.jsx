import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SlotCard from '../components/SlotCard';
import api, { getErrorMessage } from '../services/api';

export default function Slots() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parkingId = searchParams.get('parkingId');

  const [parking, setParking] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/parking/${parkingId}`);
        setParking(res.data.parking);
        setSlots(res.data.parking.slots);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load parking slots.'));
      } finally {
        setLoading(false);
      }
    }
    if (parkingId) load();
  }, [parkingId]);

  function bookSlot() {
    if (!selected) return;
    navigate(`/book?parkingId=${parking.id}&slotId=${selected.id}`);
  }

  const counts = slots.reduce(
    (acc, slot) => {
      acc[slot.status] = (acc[slot.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          {loading ? (
            <div className="loader">Loading slots…</div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : parking ? (
            <>
              <div className="section-heading">
                <span className="eyebrow">Available Slots</span>
                <h2>{parking.name}</h2>
                <p className="section-sub">{parking.address}</p>
              </div>

              <div className="legend">
                <span className="legend-item"><span className="legend-dot dot-available" /> Available</span>
                <span className="legend-item"><span className="legend-dot dot-occupied" /> Occupied</span>
                <span className="legend-item"><span className="legend-dot dot-reserved" /> Reserved</span>
                <span className="legend-item"><span className="legend-dot dot-selected" /> Selected</span>
              </div>

              <div className="slot-grid">
                {slots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    selected={selected?.id === slot.id}
                    selectable
                    onSelect={setSelected}
                  />
                ))}
              </div>

              <div className="slot-footer">
                <div className="slot-summary">
                  <strong>{parking.availableSlots}</strong> of <strong>{parking.totalSlots}</strong> slots
                  available · ₹{parking.pricePerHour}/hour
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!selected}
                  onClick={bookSlot}
                >
                  {selected ? `Book Slot ${selected.slotNumber}` : 'Select a Slot to Continue'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </>
  );
}