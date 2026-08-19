import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParkingCard from '../components/ParkingCard';
import api, { getErrorMessage } from '../services/api';

const features = [
  { title: 'Real-Time Availability', text: 'Live slot status for every parking location so you always know what is free.' },
  { title: 'Instant Booking', text: 'Reserve your slot in seconds and pay online — no more circling the block.' },
  { title: 'Easy Payments', text: 'Pay with UPI, Card, or Cash. Simple and completely secure.' },
  { title: 'EV & Bike Friendly', text: 'Dedicated slots for EVs and bikes at selected parking locations.' },
];

const steps = [
  { title: 'Search a Location', text: 'Type an area or landmark and browse nearby parking spots.' },
  { title: 'Pick a Free Slot', text: 'See live availability and choose the slot that suits you.' },
  { title: 'Choose Date & Time', text: 'Set your start and end time — the fee is calculated instantly.' },
  { title: 'Pay & Park', text: 'Confirm your booking, pay, and park hassle-free.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.get('/parking');
        setParkings(res.data.parkings.slice(0, 4));
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load featured parking.'));
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/parking?q=${encodeURIComponent(q)}` : '/parking');
  }

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy fade-in-up">
              <span className="eyebrow">Smart Parking Platform</span>
              <h1>Find. Book. Park. Hassle-Free.</h1>
              <p>
                Discover parking locations near you, check live slot availability,
                and book your spot in under a minute.
              </p>

              <form className="hero-search" onSubmit={handleSearch}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search parking location, area, or landmark…"
                />
                <button type="submit" className="button button-primary">
                  Search
                </button>
              </form>

              <div className="hero-highlights">
                <div>
                  <strong>Live availability</strong>
                  <p>See free slots in real time.</p>
                </div>
                <div>
                  <strong>Instant confirmation</strong>
                  <p>Get your booking id right away.</p>
                </div>
                <div>
                  <strong>Multiple vehicles</strong>
                  <p>Cars, bikes and EVs welcome.</p>
                </div>
                <div>
                  <strong>Easy payment</strong>
                  <p>UPI, Card or Cash.</p>
                </div>
              </div>
            </div>

            <div className="hero-image fade-in-up-delay-3">
              <img src="/images/parking-illustration.png" alt="Smart parking illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured parking */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Live Right Now</span>
            <h2>Featured Parking Locations</h2>
            <p className="section-sub">
              {loading
                ? 'Loading locations…'
                : 'A snapshot of parking spots you can book instantly.'}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="parking-grid">
            {parkings.map((parking) => (
              <ParkingCard key={parking.id} parking={parking} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading center">
            <span className="eyebrow">Why SmartPark?</span>
            <h2>Everything You Need to Park</h2>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="container">
          <div className="section-heading center">
            <span className="eyebrow">How It Works</span>
            <h2>Parking in Four Easy Steps</h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <article key={step.title} className="step-card">
                <span className="step-number">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}