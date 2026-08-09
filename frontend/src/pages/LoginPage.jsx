import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear server message on change
    if (serverMessage.text) {
      setServerMessage({ text: '', type: '' });
    }
  }

  function validate() {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!form.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (form.password.trim().length < 6) {
      newErrors.password = 'Password should be at least 6 characters.';
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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password.trim(),
          rememberMe: form.rememberMe,
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
        text: data.message || 'Login successful! Redirecting...',
        type: 'success',
      });

      localStorage.setItem('sp_user', JSON.stringify(data.user));

      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      const errorMessage =
        err.name === 'TypeError' || err.message === 'Failed to fetch'
          ? 'Unable to connect to the backend server. Please ensure the backend server is running.'
          : err.message || 'Login failed.';
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
      <AuthHeader altPage="register" />

      <main className="container auth-grid">
        <section className="auth-panel">
          <div className="auth-card fade-in-up">
            <span className="eyebrow">Smart Parking Login</span>
            <h1>Welcome Back!</h1>

            <form id="loginForm" onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input
                  type="email"
                  id="loginEmail"
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

              {/* Password */}
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="loginPassword"
                    name="password"
                    placeholder="Enter your password"
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

              {/* Remember / Forgot */}
              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={form.rememberMe}
                    onChange={handleChange}
                  />
                  Remember Me
                </label>
                <a href="#" className="text-link">
                  Forgot Password?
                </a>
              </div>

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
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <button
                type="button"
                className="button button-secondary google-button"
              >
                Continue with Google
              </button>
            </form>

            <p className="form-note">
              Don&apos;t have an account?{' '}
              <Link to="/register">Register</Link>
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
