import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getErrorMessage, storeUser } from '../services/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/login', { email: email.trim(), password });
      storeUser(res.data.user);
      setMessage({ text: 'Login successful! Redirecting…', type: 'success' });
      setTimeout(() => {
        navigate(res.data.user.role === 'admin' ? '/admin' : '/');
      }, 600);
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Login failed.'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <Navbar />
      <div className="container auth-grid">
        <section className="auth-panel">
          <div className="auth-card fade-in-up">
            <span className="eyebrow">Smart Parking Login</span>
            <h1>Welcome Back!</h1>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="password-input-group">
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>

              {message.text && (
                <p className={`form-message ${message.type === 'error' ? 'form-error' : 'form-success'}`}>
                  {message.text}
                </p>
              )}

              <button type="submit" className="button button-primary form-submit" disabled={submitting}>
                {submitting ? 'Logging in…' : 'Login'}
              </button>

              <div className="demo-credentials">
                <strong>Demo accounts</strong>
                <span>Admin · admin@smartpark.in · admin123</span>
                <span>User · demo@smartpark.in · demo1234</span>
              </div>
            </form>

            <p className="form-note">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </section>

        <section className="auth-illustration fade-in-up-delay-2">
          <img src="/images/parking-illustration.png" alt="Parking illustration" />
        </section>
      </div>
    </main>
  );
}