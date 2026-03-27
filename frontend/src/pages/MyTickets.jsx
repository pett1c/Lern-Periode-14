import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
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
      <section className="content">
        <div className="ev-row">
          <h1>Meine Tickets</h1>
          <span className="pill p-red">{tickets.length} Tickets</span>
        </div>
        <div className="toggle">
          <button className={`btn btn-sm ${!showPast ? 'btn-red' : 'btn-ghost'}`} type="button" onClick={() => setShowPast(false)}>Bevorstehend</button>
          <button className={`btn btn-sm ${showPast ? 'btn-red' : 'btn-ghost'}`} type="button" onClick={() => setShowPast(true)}>Vergangen</button>
        </div>
        {error ? <p className="err">{error}</p> : null}
        <div className="tickets-list">
          {filtered.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} onCancel={onCancel} />)}
        </div>
      </section>
    </main>
  );
}
