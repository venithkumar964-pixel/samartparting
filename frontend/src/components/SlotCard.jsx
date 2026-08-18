import { useNavigate } from 'react-router-dom';

// Slot status colours:
//   available -> green,  occupied -> red,  reserved -> yellow,  selected -> blue
export default function SlotCard({ slot, selected, selectable, onSelect }) {
  const navigate = useNavigate();
  const isAvailable = slot.status === 'available';
  const active = selectable && isAvailable;
  const className = [
    'slot-card',
    `slot-${slot.status}`,
    selected ? 'slot-selected' : '',
  ].join(' ');

  function handleClick() {
    if (!active) return;
    if (selected) {
      onSelect(null);
    } else if (onSelect) {
      onSelect(slot);
    }
  }

  return (
    <div className={className} role={active ? 'button' : undefined} onClick={handleClick}>
      <span className="slot-number">{slot.slotNumber}</span>
      <span className="slot-meta">{slot.slotType.toUpperCase()}</span>
      <span className="slot-status-label">
        {selected ? 'Selected' : slot.status}
      </span>
    </div>
  );
}