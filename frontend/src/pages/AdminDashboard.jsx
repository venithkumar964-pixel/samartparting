import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getErrorMessage, isAdmin } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [parkings, setParkings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);

  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Parking form state (add / edit)
  const [parkingForm, setParkingForm] = useState({
    id: null, name: '', address: '', pricePerHour: '', status: 'open',
  });

  // Slot form state
  const [slotForm, setSlotForm] = useState({
    parkingId: '', slotNumber: '', slotType: 'car', status: 'available',
  });
  const [slotsByParking, setSlotsByParking] = useState({});

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/login', { replace: true });
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [dash, usersRes, parkingRes, bookingRes, paymentRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/users'),
        api.get('/parking'),
        api.get('/bookings'),
        api.get('/payments'),
      ]);
      setStats(dash.data.dashboard);
      setUsers(usersRes.data.users);
      setParkings(parkingRes.data.parkings);
      setBookings(bookingRes.data.bookings);
      setPayments(paymentRes.data.payments);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard.'));
    } finally {
      setLoading(false);
    }
  }

  function flash(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  }

  // ------------------------------------------------------------------ users
  async function toggleUserRole(user) {
    try {
      await api.put(`/users/${user.id}`, { role: user.role === 'admin' ? 'user' : 'admin' });
      flash(`Role updated for ${user.name}.`);
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    try {
      await api.delete(`/users/${user.id}`);
      flash('User deleted.');
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  // ----------------------------------------------------------------- parking
  async function saveParking(e) {
    e.preventDefault();
    const payload = {
      name: parkingForm.name.trim(),
      address: parkingForm.address.trim(),
      pricePerHour: Number(parkingForm.pricePerHour),
      status: parkingForm.status,
    };
    try {
      if (parkingForm.id) {
        await api.put(`/parking/${parkingForm.id}`, payload);
        flash('Parking location updated.');
      } else {
        await api.post('/parking', payload);
        flash('Parking location added.');
      }
      setParkingForm({ id: null, name: '', address: '', pricePerHour: '', status: 'open' });
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  function editParking(parking) {
    setParkingForm({
      id: parking.id, name: parking.name, address: parking.address,
      pricePerHour: parking.pricePerHour, status: parking.status,
    });
    setTab('parking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteParking(parking) {
    if (!window.confirm(`Delete parking "${parking.name}"?`)) return;
    try {
      await api.delete(`/parking/${parking.id}`);
      flash('Parking location deleted.');
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  // ------------------------------------------------------------------- slots
  async function loadSlots(parkingId) {
    if (!parkingId) return;
    try {
      const res = await api.get(`/parking/${parkingId}/slots`);
      setSlotsByParking((prev) => ({ ...prev, [parkingId]: res.data.slots }));
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  async function addSlot(e) {
    e.preventDefault();
    if (!slotForm.parkingId) {
      flash('Select a parking location first.', 'error');
      return;
    }
    try {
      await api.post('/slots', {
        parking_id: slotForm.parkingId,
        slotNumber: slotForm.slotNumber.trim(),
        slotType: slotForm.slotType,
        status: slotForm.status,
      });
      flash('Slot added.');
      setSlotForm((prev) => ({ ...prev, slotNumber: '' }));
      loadSlots(slotForm.parkingId);
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  async function changeSlotStatus(slot) {
    const status = window.prompt('New status (available / occupied / reserved):', slot.status);
    if (!status || !['available', 'occupied', 'reserved'].includes(status)) return;
    try {
      await api.put(`/slots/${slot.id}`, { status });
      flash('Slot updated.');
      loadSlots(slot.parkingId);
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  async function deleteSlot(slot) {
    if (!window.confirm(`Delete slot ${slot.slotNumber}?`)) return;
    try {
      await api.delete(`/slots/${slot.id}`);
      flash('Slot deleted.');
      loadSlots(slot.parkingId);
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  // ---------------------------------------------------------------- bookings
  async function cancelBooking(booking) {
    if (!window.confirm(`Cancel booking #${booking.id}?`)) return;
    try {
      await api.put(`/bookings/${booking.id}`, { status: 'cancelled' });
      flash('Booking cancelled.');
      loadAll();
    } catch (err) {
      flash(getErrorMessage(err), 'error');
    }
  }

  // -------------------------------------------------------------------- view
  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers },
    { label: 'Parking Locations', value: stats?.totalParking },
    { label: 'Total Slots', value: stats?.totalSlots },
    { label: 'Available Slots', value: stats?.availableSlots },
    { label: 'Occupied Slots', value: stats?.occupiedSlots },
    { label: 'Total Bookings', value: stats?.totalBookings },
    { label: 'Total Revenue', value: `₹${stats?.revenue}` },
  ];

  if (loading) return (<><Navbar /><div className="loader section page-top">Loading admin dashboard…</div></>);
  if (error) return (<><Navbar /><div className="section page-top container"><div className="alert alert-error">{error}</div></div></>);

  const tabs = [
    ['overview', 'Overview'],
    ['users', 'Users'],
    ['parking', 'Parking'],
    ['slots', 'Slots'],
    ['bookings', 'Bookings'],
    ['payments', 'Payments'],
  ];

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Admin Panel</span>
            <h2>Admin Dashboard</h2>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
              {message.text}
            </div>
          )}

          <div className="admin-tabs">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`admin-tab ${tab === id ? 'admin-tab-active' : ''}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ---------------------------------------------------- overview */}
          {tab === 'overview' && (
            <>
              <div className="stat-grid">
                {statCards.map((card) => (
                  <div key={card.label} className="stat-card">
                    <span className="stat-label">{card.label}</span>
                    <span className="stat-number">{card.value ?? '—'}</span>
                  </div>
                ))}
              </div>

              <div className="split-columns">
                <div className="panel">
                  <h3 className="block-title">Recent Bookings</h3>
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="mini-row">
                      <span>#{b.id} · {b.parkingName} · {b.slotNumber}</span>
                      <span className={`badge badge-status-${b.status}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <h3 className="block-title">Recent Payments</h3>
                  {payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="mini-row">
                      <span>#{p.id} · Booking {p.bookingId}</span>
                      <span>₹{p.amount} · {p.paymentMethod}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ------------------------------------------------------- users */}
          {tab === 'users' && (
            <div className="panel table-panel">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Vehicle</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.vehicleNumber} ({u.vehicleType})</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                      <td className="table-actions">
                        <button type="button" className="button button-small" onClick={() => toggleUserRole(u)}>
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        {u.role !== 'admin' && (
                          <button type="button" className="button button-small button-danger" onClick={() => deleteUser(u)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ----------------------------------------------------- parking */}
          {tab === 'parking' && (
            <>
              <div className="panel">
                <h3 className="block-title">{parkingForm.id ? 'Edit Parking Location' : 'Add Parking Location'}</h3>
                <form className="admin-form" onSubmit={saveParking}>
                  <input
                    type="text" placeholder="Parking name" value={parkingForm.name}
                    onChange={(e) => setParkingForm((p) => ({ ...p, name: e.target.value }))} required
                  />
                  <input
                    type="text" placeholder="Address" value={parkingForm.address}
                    onChange={(e) => setParkingForm((p) => ({ ...p, address: e.target.value }))} required
                  />
                  <input
                    type="number" min="0" step="0.1" placeholder="Price per hour (₹)"
                    value={parkingForm.pricePerHour}
                    onChange={(e) => setParkingForm((p) => ({ ...p, pricePerHour: e.target.value }))} required
                  />
                  <select
                    value={parkingForm.status}
                    onChange={(e) => setParkingForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button type="submit" className="button button-primary">
                    {parkingForm.id ? 'Update' : 'Add'}
                  </button>
                  {parkingForm.id && (
                    <button type="button" className="button button-secondary" onClick={() => setParkingForm({ id: null, name: '', address: '', pricePerHour: '', status: 'open' })}>
                      Cancel
                    </button>
                  )}
                </form>
              </div>

              <div className="panel table-panel">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Address</th><th>Slots</th><th>Available</th><th>Price/hr</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {parkings.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.address}</td>
                        <td>{p.totalSlots}</td>
                        <td>{p.availableSlots}</td>
                        <td>₹{p.pricePerHour}</td>
                        <td><span className={`badge ${p.status === 'open' ? 'badge-paid' : 'badge-failed'}`}>{p.status}</span></td>
                        <td className="table-actions">
                          <button type="button" className="button button-small" onClick={() => editParking(p)}>Edit</button>
                          <button type="button" className="button button-small button-danger" onClick={() => deleteParking(p)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ------------------------------------------------------ slots */}
          {tab === 'slots' && (
            <>
              <div className="panel">
                <h3 className="block-title">Add Slot</h3>
                <form className="admin-form" onSubmit={addSlot}>
                  <select value={slotForm.parkingId} onChange={(e) => setSlotForm((s) => ({ ...s, parkingId: e.target.value }))} required>
                    <option value="">Select parking location</option>
                    {parkings.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="text" placeholder="Slot number (e.g. A06)" value={slotForm.slotNumber}
                    onChange={(e) => setSlotForm((s) => ({ ...s, slotNumber: e.target.value }))} required
                  />
                  <select value={slotForm.slotType} onChange={(e) => setSlotForm((s) => ({ ...s, slotType: e.target.value }))}>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="ev">EV</option>
                  </select>
                  <select value={slotForm.status} onChange={(e) => setSlotForm((s) => ({ ...s, status: e.target.value }))}>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                  <button type="submit" className="button button-primary">Add Slot</button>
                </form>
              </div>

              <div className="panel">
                <h3 className="block-title">Manage Slots</h3>
                <div className="admin-form">
                  <select value={slotForm.parkingId} onChange={(e) => { const id = e.target.value; setSlotForm((s) => ({ ...s, parkingId: id })); loadSlots(id); }}>
                    <option value="">Select parking location</option>
                    {parkings.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                {slotForm.parkingId && (
                  <div className="slot-grid admin-slot-grid">
                    {(slotsByParking[slotForm.parkingId] || []).map((slot) => (
                      <div key={slot.id} className={`slot-card slot-${slot.status}`}>
                        <span className="slot-number">{slot.slotNumber}</span>
                        <span className="slot-meta">{slot.slotType.toUpperCase()}</span>
                        <span className="slot-status-label">{slot.status}</span>
                        <div className="slot-admin-actions">
                          <button type="button" className="button button-small" onClick={() => changeSlotStatus(slot)}>Status</button>
                          <button type="button" className="button button-small button-danger" onClick={() => deleteSlot(slot)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ---------------------------------------------------- bookings */}
          {tab === 'bookings' && (
            <div className="panel table-panel">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>User</th><th>Parking</th><th>Slot</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const user = users.find((u) => u.id === b.userId);
                    return (
                      <tr key={b.id}>
                        <td>#{b.id}</td>
                        <td>{user ? user.name : `User ${b.userId}`}</td>
                        <td>{b.parkingName}</td>
                        <td>{b.slotNumber}</td>
                        <td>{b.bookingDate}</td>
                        <td>{b.startTime}—{b.endTime}</td>
                        <td>₹{b.amount}</td>
                        <td><span className={`badge badge-status-${b.status}`}>{b.status}</span></td>
                        <td>
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <button type="button" className="button button-small button-danger" onClick={() => cancelBooking(b)}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ---------------------------------------------------- payments */}
          {tab === 'payments' && (
            <div className="panel table-panel">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>#{p.bookingId}</td>
                      <td>₹{p.amount}</td>
                      <td>{p.paymentMethod}</td>
                      <td><span className={`badge ${p.paymentStatus === 'paid' ? 'badge-paid' : 'badge-failed'}`}>{p.paymentStatus}</span></td>
                      <td>{p.paymentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}