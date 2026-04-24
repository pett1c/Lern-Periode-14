import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
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
      alert('Booked!');
    } catch (err) {
      alert(err.message);
    }
  }

  if (!event) return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <p style={{ padding: 40 }}>{error || 'Loading Event...'}</p>
      </div>
    </main>
  );

  const bgColors = [
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)'
  ];
  const charCodeSum = event.title ? event.title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
  const bgStyle = { background: bgColors[charCodeSum % bgColors.length] };
  const displayImage = event.imageUrl ? { backgroundImage: `url(${event.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : bgStyle;

  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...displayImage, height: '300px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 24, left: 40, background: 'var(--white)', padding: '6px 16px', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', border: '1px solid var(--border)' }}>
              {event.genre || 'Event'}
            </div>
            <div style={{ position: 'absolute', top: 24, right: 40, background: 'var(--red)', color: 'var(--white)', padding: '8px 16px', fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <section className="content-fluid detail-layout" style={{ marginTop: '30px' }}>
            <article className="card" style={{ padding: '32px' }}>
              <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--f-display)', marginTop: 0, marginBottom: '20px' }}>{event.title}</h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink-mid)', marginBottom: '30px' }}>{event.description}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ margin: 0 }}><strong>Location:</strong> {event.location}</p>
                <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-GB')}</p>
              </div>
            </article>
            
            <aside className="card" style={{ height: 'fit-content', padding: '24px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem' }}>Select Ticket</h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <select 
                  value={ticketType} 
                  onChange={(e) => setTicketType(e.target.value)} 
                  style={{ padding: '14px', fontSize: '0.95rem', cursor: 'pointer', background: 'var(--light2)', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '6px 6px 0 0', outline: 'none' }}
                >
                  {event.ticketTypes?.map((t) => <option key={t.name} value={t.name}>{t.name} - CHF {t.price}</option>)}
                </select>
                
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  style={{ padding: '14px', fontSize: '1rem', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '0', outline: 'none', background: 'var(--white)' }} 
                />
                
                <button 
                  type="button" 
                  disabled={user?.role !== 'user'} 
                  onClick={onBook} 
                  style={{ padding: '16px', fontSize: '1rem', fontWeight: 'bold', background: 'var(--red)', color: 'var(--white)', border: 'none', borderRadius: '0 0 6px 6px', cursor: 'pointer' }}
                >
                  Book Now
                </button>
              </div>
              {user?.role !== 'user' && <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', textAlign: 'center', margin: '12px 0 0' }}>Log in as a user to book tickets.</p>}
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

