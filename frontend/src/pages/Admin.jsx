import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getAdminEvents, getAdminTickets } from '../api/adminApi';

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAdminEvents(), getAdminTickets()])
      .then(([eventData, ticketData]) => {
        setEvents(eventData);
        setTickets(ticketData);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="page-shell">
      <Navbar />
      <section className="content">
        <h1>Admin Panel</h1>
        {error ? <p className="err">{error}</p> : null}
        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Events</div><div className="stat-val">{events.length}</div></div>
          <div className="stat-card"><div className="stat-label">Tickets</div><div className="stat-val">{tickets.length}</div></div>
          <div className="stat-card"><div className="stat-label">Offen</div><div className="stat-val">7</div></div>
          <div className="stat-card"><div className="stat-label">Status</div><div className="stat-val">Admin</div></div>
        </div>
        <div className="g2">
          <div className="card">
            <h3>Events</h3>
            {events.slice(0, 8).map((event) => <p key={event._id}>{event.title}</p>)}
          </div>
          <div className="card">
            <h3>Tickets</h3>
            {tickets.slice(0, 8).map((ticket) => <p key={ticket._id}>{ticket.ticketType} ({ticket.status})</p>)}
          </div>
        </div>
      </section>
    </main>
  );
}
