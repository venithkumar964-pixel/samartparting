import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Parking from './pages/Parking';
import Slots from './pages/Slots';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { isLoggedIn, isAdmin } from './services/api';

// Guard: redirect to /login when the user is not signed in.
function RequireAuth({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

// Guard: redirect to /login when the user is not an admin.
function RequireAdmin({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/parking" element={<RequireAuth><Parking /></RequireAuth>} />
      <Route path="/slots" element={<RequireAuth><Slots /></RequireAuth>} />
      <Route path="/book" element={<RequireAuth><Booking /></RequireAuth>} />
      <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />
      <Route path="/confirmation" element={<RequireAuth><Confirmation /></RequireAuth>} />
      <Route path="/my-bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />

      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}