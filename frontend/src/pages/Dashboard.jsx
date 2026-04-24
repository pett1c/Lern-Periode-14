import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import AsyncState from '../components/AsyncState';
import { getEvents } from '../api/eventApi';
import { bookTicket } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingMessage, setBookingMessage] = useState('');

  async function loadEvents() {
    setLoading(true);
    setError('');
    try {
      const loaded = await getEvents();
      setEvents(loaded);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function onBook(event) {
    setBookingMessage('');
    try {
      await bookTicket({ eventId: event._id, ticketType: event.ticketTypes?.[0]?.name || 'STANDARD', quantity: 1 });
      setBookingMessage('Ticket erfolgreich gebucht.');
    } catch (err) {
      setBookingMessage(err.message);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />
      <section className="content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Hallo {user?.name}</p>
        </div>
        {bookingMessage ? <p className="small">{bookingMessage}</p> : null}
        <AsyncState
          state={error ? 'error' : loading ? 'loading' : events.length === 0 ? 'empty' : null}
          message={error || (loading ? 'Events werden geladen...' : 'Noch keine Events vorhanden.')}
          onRetry={loadEvents}
        />
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Events Live</div><div className="stat-val">{events.length}</div></div>
          <div className="stat-card"><div className="stat-label">Rolle</div><div className="stat-val">{user?.role}</div></div>
          <div className="stat-card"><div className="stat-label">Status</div><div className="stat-val">Aktiv</div></div>
          <div className="stat-card"><div className="stat-label">AI</div><div className="stat-val">Ready</div></div>
        </div>
        <div className="g2 charts-row">
          <article className="card">
            <h3 className="section-title">Ticketverkäufe - 7 Tage</h3>
            <div className="bar-ch">
              <div className="bar" style={{ height: '44%' }} />
              <div className="bar" style={{ height: '66%' }} />
              <div className="bar" style={{ height: '50%' }} />
              <div className="bar" style={{ height: '80%' }} />
              <div className="bar" style={{ height: '57%' }} />
              <div className="bar hi" style={{ height: '92%' }} />
              <div className="bar" style={{ height: '70%' }} />
            </div>
          </article>
          <article className="card">
            <h3 className="section-title">Top Kategorien</h3>
            <div className="cat-row"><span>Musik</span><div className="prog"><div className="prog-fill" style={{ width: '42%' }} /></div></div>
            <div className="cat-row"><span>Tech</span><div className="prog"><div className="prog-fill" style={{ width: '28%' }} /></div></div>
            <div className="cat-row"><span>Kunst</span><div className="prog"><div className="prog-fill" style={{ width: '18%' }} /></div></div>
          </article>
        </div>
        <h2 className="section-title">Bevorstehende Events</h2>
        <div className="g3">
          {events.map((event) => <EventCard key={event._id} event={event} onBook={user?.role === 'user' ? onBook : null} />)}
        </div>
      </section>
    </main>
  );
}
