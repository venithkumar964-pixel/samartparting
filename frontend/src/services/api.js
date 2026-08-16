import axios from 'axios';

// Axios instance pre-configured for the Flask backend.
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the logged-in user's id to every request so the backend
// can identify who is making the call (simple demo authentication).
api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user && user.id) {
    config.headers['X-User-Id'] = String(user.id);
  }
  return config;
});

// --------------------------------------------------------------------------
// Authentication state helpers (stored in localStorage)
// --------------------------------------------------------------------------

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('sp_user') || 'null');
  } catch {
    return null;
  }
}

export function storeUser(user) {
  localStorage.setItem('sp_user', JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem('sp_user');
}

export function isLoggedIn() {
  return Boolean(getStoredUser());
}

export function isAdmin() {
  const user = getStoredUser();
  return Boolean(user && user.role === 'admin');
}

// --------------------------------------------------------------------------
// Error helper
// --------------------------------------------------------------------------

export function getErrorMessage(error, fallback) {
  if (!error.response) {
    return 'Unable to connect to the backend server. Please start Flask on port 5000.';
  }
  return error.response.data?.error || error.message || fallback || 'Something went wrong.';
}

export default api;