import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
      <section className="content">
        <h1>Event erstellen</h1>
        <div className="steps">Schritt {step} / 4</div>
        <form className="card" onSubmit={onSubmit}>
          <div className="g2">
            <div>
              <label className="fl">Titel</label>
              <input className="fi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="fl">Ort</label>
              <input className="fi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>
          </div>
          <label className="fl">Beschreibung</label>
          <textarea className="fi ta" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <label className="fl">Datum</label>
          <input className="fi" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <div className="g2">
            <input className="fi" type="number" min="0" value={form.standardPrice} onChange={(e) => setForm({ ...form, standardPrice: e.target.value })} />
            <input className="fi" type="number" min="1" value={form.standardCapacity} onChange={(e) => setForm({ ...form, standardCapacity: e.target.value })} />
            <input className="fi" type="number" min="0" value={form.vipPrice} onChange={(e) => setForm({ ...form, vipPrice: e.target.value })} />
            <input className="fi" type="number" min="1" value={form.vipCapacity} onChange={(e) => setForm({ ...form, vipCapacity: e.target.value })} />
          </div>
          {error ? <p className="err">{error}</p> : null}
          <div className="ev-row">
            <button className="btn btn-ghost" type="button" onClick={() => setStep((s) => Math.max(1, s - 1))}>Zurück</button>
            <button className="btn btn-red" type="submit">Veröffentlichen</button>
          </div>
        </form>
      </section>
    </main>
  );
}
