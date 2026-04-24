import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EventCard from '../components/EventCard';
import { getEvents } from '../api/eventApi';
import { bookTicket } from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getEvents().then(setEvents).catch((err) => setError(err.message));
  }, []);

  async function onBook(event) {
    try {
      await bookTicket({ eventId: event._id, ticketType: event.ticketTypes?.[0]?.name || 'STANDARD', quantity: 1 });
      alert('Ticket booked.');
    } catch (err) {
      alert(err.message);
    }
  }

  const filteredEvents = events.filter(e => {
    if (filter && e.genre?.toLowerCase() !== filter.toLowerCase()) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <section className="content-fluid">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>All Events</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <button className="btn btn-ghost" onClick={() => navigate('/events/create')}>+ Create Event</button>
              )}
              <button className="btn btn-red" onClick={() => navigate('/chat')}>✦ AI Assistant</button>
            </div>
          </div>
          {error ? <p className="err">{error}</p> : null}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="fi" 
                placeholder="Search events..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '200px', height: '38px', background: 'var(--white)' }} 
              />
              <select className="fi" style={{ width: '140px', height: '38px', cursor: 'pointer', background: 'var(--white)' }} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="music">Music</option>
                <option value="technology">Technology</option>
                <option value="esports">Esports</option>
                <option value="theater">Theater</option>
                <option value="sports">Sports</option>
                <option value="art">Art</option>
                <option value="health">Health</option>
              </select>
            </div>
          </div>
          <div className="g3">
            {filteredEvents.map((event) => <EventCard key={event._id} event={event} />)}
            {filteredEvents.length === 0 && <p>No events found matching your criteria.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
