import { Link } from 'react-router-dom';

export default function ParkingCard({ parking }) {
  const isOpen = parking.status === 'open';

  return (
    <article className="parking-card">
      <div className="parking-card-head">
        <div>
          <h3>{parking.name}</h3>
          <p className="parking-address">{parking.address}</p>
        </div>
        <span className={`status-badge ${isOpen ? 'badge-open' : 'badge-closed'}`}>
          {isOpen ? 'Open' : 'Closed'}
        </span>
      </div>

      <div className="parking-card-stats">
        <div className="stat">
          <span className="stat-label">Total Slots</span>
          <span className="stat-value">{parking.totalSlots}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Available</span>
          <span className="stat-value stat-green">{parking.availableSlots}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Fee</span>
          <span className="stat-value">₹{parking.pricePerHour}/hr</span>
        </div>
      </div>

      <Link
        to={isOpen ? `/slots?parkingId=${parking.id}` : '/parking'}
        className={`button ${isOpen ? 'button-primary' : 'button-secondary'} parking-card-btn`}
        aria-disabled={!isOpen}
        onClick={(e) => {
          if (!isOpen) e.preventDefault();
        }}
      >
        {isOpen ? 'View Slots' : 'Currently Closed'}
      </Link>
    </article>
  );
}