import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { getErrorMessage, storeUser } from '../services/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
const vehiclePattern = /^[A-Za-z0-9\-\s]{3,15}$/;

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  vehicleNumber: '',
  vehicleType: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function validate() {
    const next = {};

    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!emailPattern.test(form.email.trim())) next.email = 'Please enter a valid email.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    else if (!phonePattern.test(form.phone.trim())) next.phone = 'Enter a valid phone number.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.';
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (!form.vehicleNumber.trim()) next.vehicleNumber = 'Vehicle number is required.';
    else if (!vehiclePattern.test(form.vehicleNumber.trim())) next.vehicleNumber = 'Enter a valid vehicle number.';
    if (!form.vehicleType) next.vehicleType = 'Please select your vehicle type.';

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        vehicleNumber: form.vehicleNumber.trim(),
        vehicleType: form.vehicleType,
      });
      storeUser(res.data.user);
      setMessage({ text: 'Account created successfully! Redirecting…', type: 'success' });
      setForm(initialForm);
      setTimeout(() => navigate('/'), 600);
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Registration failed.'), type: 'error' });
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
            <span className="eyebrow">Smart Parking Registration</span>
            <h1>Create Your Account</h1>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="regName">Full Name</label>
                <input id="regName" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div className="form-row split-row">
                <div className="form-group">
                  <label htmlFor="regEmail">Email</label>
                  <input id="regEmail" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
                  {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="regPhone">Phone Number</label>
                  <input id="regPhone" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
              </div>

              <div className="form-row split-row">
                <div className="form-group">
                  <label htmlFor="regPassword">Password</label>
                  <div className="password-input-group">
                    <input
                      id="regPassword"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((p) => !p)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="regConfirm">Confirm Password</label>
                  <input id="regConfirm" name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} />
                  {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="form-row split-row">
                <div className="form-group">
                  <label htmlFor="regVehicle">Vehicle Number</label>
                  <input id="regVehicle" name="vehicleNumber" placeholder="TN-01-AB-1234" value={form.vehicleNumber} onChange={handleChange} />
                  {errors.vehicleNumber && <p className="field-error">{errors.vehicleNumber}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="regType">Vehicle Type</label>
                  <select id="regType" name="vehicleType" value={form.vehicleType} onChange={handleChange}>
                    <option value="">Select type</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="ev">EV</option>
                  </select>
                  {errors.vehicleType && <p className="field-error">{errors.vehicleType}</p>}
                </div>
              </div>

              {message.text && (
                <p className={`form-message ${message.type === 'error' ? 'form-error' : 'form-success'}`}>
                  {message.text}
                </p>
              )}

              <button type="submit" className="button button-primary form-submit" disabled={submitting}>
                {submitting ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="form-note">
              Already have an account? <Link to="/login">Login</Link>
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