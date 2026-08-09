import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
const vehiclePattern = /^[A-Za-z0-9\-\s]{3,15}$/;

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleNumber: '',
    vehicleType: '',
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email.';
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phonePattern.test(form.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number.';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (form.password.trim().length < 8) {
      newErrors.password = 'Use at least 8 characters.';
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!form.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required.';
    } else if (!vehiclePattern.test(form.vehicleNumber.trim())) {
      newErrors.vehicleNumber = 'Enter a valid vehicle number.';
    }

    if (!form.vehicleType) {
      newErrors.vehicleType = 'Please select your vehicle type.';
    }

    if (!form.terms) {
      newErrors.terms = 'You must agree to the terms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerMessage({ text: '', type: '' });

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password.trim(),
          vehicleNumber: form.vehicleNumber.trim(),
          vehicleType: form.vehicleType,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setServerMessage({
          text: data.error || `Server error (${response.status}). Please try again.`,
          type: 'error',
        });
        return;
      }

      setServerMessage({
        text: data.message || 'Account created successfully!',
        type: 'success',
      });

      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        vehicleNumber: '',
        vehicleType: '',
        terms: false,
      });
    } catch (err) {
      const errorMessage =
        err.name === 'TypeError' || err.message === 'Failed to fetch'
          ? 'Unable to connect to the backend server. Please ensure the backend server is running.'
          : err.message || 'Registration failed.';
      setServerMessage({
        text: errorMessage,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <AuthHeader altPage="login" />

      <main className="container auth-grid">
        <section className="auth-panel">
          <div className="auth-card fade-in-up">
            <span className="eyebrow">Smart Parking Registration</span>
            <h1>Create Your Account</h1>

            <form id="registerForm" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                {errors.fullName && (
                  <p className="field-error">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="registerEmail">Email</label>
                <input
                  type="email"
                  id="registerEmail"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <p className="field-error">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phone"
                  placeholder="+1 555 123 4567"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                {errors.phone && (
                  <p className="field-error">{errors.phone}</p>
                )}
              </div>

              {/* Password + Confirm */}
              <div className="form-row split-row">
                <div className="form-group">
                  <label htmlFor="registerPassword">Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="registerPassword"
                      name="password"
                      placeholder="Create a password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="field-error">{errors.password}</p>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="field-error">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Vehicle Number */}
              <div className="form-group">
                <label htmlFor="vehicleNumber">Vehicle Number</label>
                <input
                  type="text"
                  id="vehicleNumber"
                  name="vehicleNumber"
                  placeholder="ABC-1234"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  required
                />
                {errors.vehicleNumber && (
                  <p className="field-error">{errors.vehicleNumber}</p>
                )}
              </div>

              {/* Vehicle Type */}
              <div className="form-group">
                <label htmlFor="vehicleType">Vehicle Type</label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select vehicle type</option>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                  <option value="ev">EV</option>
                </select>
                {errors.vehicleType && (
                  <p className="field-error">{errors.vehicleType}</p>
                )}
              </div>

              {/* Terms */}
              <label className="checkbox-label check-terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                  required
                />
                I agree to the Terms &amp; Conditions
              </label>
              {errors.terms && (
                <p className="field-error">{errors.terms}</p>
              )}

              {/* Server message */}
              {serverMessage.text && (
                <p
                  className={`form-message ${
                    serverMessage.type === 'error' ? 'form-error' : 'form-success'
                  }`}
                >
                  {serverMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="button button-primary form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="form-note">
              Already have an account?{' '}
              <Link to="/login">Login</Link>
            </p>
          </div>
        </section>

        <section className="auth-illustration fade-in-up-delay-2">
          <img
            src="/images/parking-illustration.png"
            alt="Parking illustration"
          />
        </section>
      </main>
    </div>
  );
}
