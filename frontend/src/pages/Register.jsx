import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell auth-register">
      <form className="register-card" onSubmit={onSubmit}>
        <h2>Konto erstellen</h2>
        <p className="small">Bereits registriert? <Link to="/login">Anmelden</Link></p>
        <div className="role-chips">
          {['user', 'organizer'].map((role) => (
            <button key={role} type="button" className={`role-chip ${form.role === role ? 'sel' : ''}`} onClick={() => setForm({ ...form, role })}>
              <span className="chip-name">{role}</span>
            </button>
          ))}
        </div>
        <label className="fl">Name</label>
        <input className="fi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <label className="fl">E-Mail</label>
        <input className="fi" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        {form.role === 'organizer' ? (
          <>
            <label className="fl">Organisation / Künstlername</label>
            <input className="fi" value={form.organization || ''} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Optional" />
          </>
        ) : null}
        <label className="fl">Passwort</label>
        <input className="fi" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error ? <p className="err">{error}</p> : null}
        <button className="btn btn-red btn-full btn-lg" type="submit" disabled={loading}>Registrieren</button>
      </form>
    </main>
  );
}
