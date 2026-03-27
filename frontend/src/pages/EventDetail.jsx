import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getEventById } from '../api/eventApi';
import { bookTicket } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState('STANDARD');
  const [error, setError] = useState('');

  useEffect(() => {
    getEventById(id)
      .then((data) => {
        setEvent(data);
        if (data.ticketTypes?.[0]?.name) setTicketType(data.ticketTypes[0].name);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function onBook() {
    try {
      await bookTicket({ eventId: id, ticketType, quantity });
      alert('Gebucht!');
    } catch (err) {
      alert(err.message);
    }
  }

  if (!event) return <main className="page-shell"><Navbar /><p>{error || 'Lade Event...'}</p></main>;

  return (
    <main className="page-shell">
      <Navbar />
      <section className="content detail-layout">
        <article className="card">
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <p><strong>Ort:</strong> {event.location}</p>
          <p><strong>Datum:</strong> {new Date(event.date).toLocaleString()}</p>
        </article>
        <aside className="card">
          <h3>Ticket auswählen</h3>
          <select className="fi" value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
            {event.ticketTypes?.map((t) => <option key={t.name} value={t.name}>{t.name} - CHF {t.price}</option>)}
          </select>
          <input className="fi" type="number" min="1" max="20" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          <button type="button" className="btn btn-red btn-full" disabled={user?.role !== 'user'} onClick={onBook}>Jetzt buchen</button>
        </aside>
      </section>
    </main>
  );
}
