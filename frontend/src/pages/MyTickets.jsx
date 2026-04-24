import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import { cancelTicket, getMyTickets } from '../api/ticketApi';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyTickets().then(setTickets).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    if (showPast) return tickets.filter((t) => new Date(t.event?.date || 0) < new Date());
    return tickets.filter((t) => new Date(t.event?.date || 0) >= new Date());
  }, [tickets, showPast]);

  async function onCancel(id) {
    try {
      await cancelTicket(id);
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status: 'CANCELLED' } : t)));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <section className="content-fluid">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>My Tickets</h1>
            <span className="pill p-red" style={{ marginLeft: '16px' }}>{tickets.length} Tickets</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button className={`btn btn-sm ${!showPast ? 'btn-red' : 'btn-ghost'}`} type="button" onClick={() => setShowPast(false)}>Upcoming</button>
            <button className={`btn btn-sm ${showPast ? 'btn-red' : 'btn-ghost'}`} type="button" onClick={() => setShowPast(true)}>Past</button>
          </div>
          
          {error ? <p className="err">{error}</p> : null}
          <div className="tickets-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} onCancel={onCancel} />)}
            {filtered.length === 0 && <p style={{ color: 'var(--ink-light)', padding: '40px 0' }}>No tickets found.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

