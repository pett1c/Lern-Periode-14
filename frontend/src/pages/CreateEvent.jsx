import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { createEvent } from '../api/eventApi';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    standardPrice: 50,
    standardCapacity: 100,
    vipPrice: 120,
    vipCapacity: 20,
  });

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const created = await createEvent({
        title: form.title,
        description: form.description,
        date: form.date,
        location: form.location,
        ticketTypes: [
          { name: 'STANDARD', price: Number(form.standardPrice), capacity: Number(form.standardCapacity) },
          { name: 'VIP', price: Number(form.vipPrice), capacity: Number(form.vipCapacity) },
        ],
      });
      navigate(`/events/${created._id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <section className="content-fluid">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>Create Event</h1>
          </div>
          
          <form className="card" onSubmit={onSubmit} style={{ padding: '32px', maxWidth: '800px' }}>
            <div className="g2" style={{ gap: '20px', marginBottom: '20px' }}>
              <div>
                <label className="fl">Title</label>
                <input className="fi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="E.g. Summer Music Festival" />
              </div>
              <div>
                <label className="fl">Location</label>
                <input className="fi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="City, Venue" />
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="fl">Description</label>
              <textarea className="fi ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Tell people about your event..." />
            </div>
            
            <div style={{ marginBottom: '20px', maxWidth: '300px' }}>
              <label className="fl">Date & Time</label>
              <input className="fi" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>

            <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Ticket Configuration</h3>
            <div className="g2" style={{ gap: '20px', marginBottom: '30px' }}>
              <div>
                <label className="fl">Standard Price ($)</label>
                <input className="fi" type="number" min="0" value={form.standardPrice} onChange={(e) => setForm({ ...form, standardPrice: e.target.value })} />
              </div>
              <div>
                <label className="fl">Standard Capacity</label>
                <input className="fi" type="number" min="1" value={form.standardCapacity} onChange={(e) => setForm({ ...form, standardCapacity: e.target.value })} />
              </div>
              <div>
                <label className="fl">VIP Price ($)</label>
                <input className="fi" type="number" min="0" value={form.vipPrice} onChange={(e) => setForm({ ...form, vipPrice: e.target.value })} />
              </div>
              <div>
                <label className="fl">VIP Capacity</label>
                <input className="fi" type="number" min="1" value={form.vipCapacity} onChange={(e) => setForm({ ...form, vipCapacity: e.target.value })} />
              </div>
            </div>

            {error ? <p className="err">{error}</p> : null}
            
            <div className="ev-row" style={{ marginTop: '20px' }}>
              <button className="btn btn-ghost" type="button" onClick={() => navigate('/events')}>Cancel</button>
              <button className="btn btn-red" type="submit">Publish Event</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

