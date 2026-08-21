import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParkingCard from '../components/ParkingCard';
import api, { getErrorMessage } from '../services/api';

export default function Parking() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const q = searchParams.get('q') || '';
        const res = await api.get('/parking', { params: { q: q || undefined } });
        setParkings(res.data.parkings);
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load parking locations.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    const target = q ? `/parking?q=${encodeURIComponent(q)}` : '/parking';
    window.location.href = target;
  }

  return (
    <>
      <Navbar />

      <main className="section page-top">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Find Parking</span>
            <h2>Search Parking Locations</h2>
            <p className="section-sub">Search by location, area, or landmark.</p>
          </div>

          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. College Road, City Mall, Station…"
            />
            <button type="submit" className="button button-primary">
              Search
            </button>
          </form>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loader">Loading parking locations…</div>
          ) : parkings.length === 0 ? (
            <div className="alert alert-info">
              No parking locations found. Try a different search term.
            </div>
          ) : (
            <div className="parking-grid">
              {parkings.map((parking) => (
                <ParkingCard key={parking.id} parking={parking} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}