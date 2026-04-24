import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
      <div className="layout-with-sidebar">
        <Sidebar />
        <section className="content-fluid">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>Admin Panel</h1>
          </div>
          
          {error ? <p className="err">{error}</p> : null}
          
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div className="stat-card" style={{ padding: '24px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="stat-label" style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Events</div>
              <div className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{events.length}</div>
            </div>
            <div className="stat-card" style={{ padding: '24px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="stat-label" style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Total Tickets</div>
              <div className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{tickets.length}</div>
            </div>
            <div className="stat-card" style={{ padding: '24px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="stat-label" style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Open Tasks</div>
              <div className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>7</div>
            </div>
            <div className="stat-card" style={{ padding: '24px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <div className="stat-label" style={{ color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '8px' }}>Status</div>
              <div className="stat-val" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--red)' }}>Active</div>
            </div>
          </div>

          <div className="g2" style={{ gap: '30px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Recent Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {events.slice(0, 8).map((event) => (
                  <div key={event._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light2)', paddingBottom: '8px' }}>
                    <span>{event.title}</span>
                    <span style={{ color: 'var(--ink-light)', fontSize: '0.85rem' }}>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Recent Ticket Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tickets.slice(0, 8).map((ticket) => (
                  <div key={ticket._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--light2)', paddingBottom: '8px' }}>
                    <span>{ticket.ticketType}</span>
                    <span className={`pill ${ticket.status === 'CANCELLED' ? 'p-red' : 'p-ink'}`}>{ticket.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

