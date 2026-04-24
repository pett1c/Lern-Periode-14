import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-brand">
        <h1>Event<em>App</em></h1>
        <p>Your universe of live experiences</p>
        <div className="brand-lines">
          <div />
          <div />
          <div />
        </div>
      </section>
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Willkommen zurück</h2>
        <p className="small">Kein Konto? <Link to="/register">Registrieren</Link></p>
        <label className="fl">E-Mail-Adresse</label>
        <input className="fi" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="fl">Passwort</label>
        <input className="fi" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error ? <p className="err">{error}</p> : null}
        <button className="btn btn-red btn-full btn-lg" type="submit" disabled={loading}>Anmelden</button>
        <div className="or-line"><span>ODER</span></div>
        <div className="oauth-row">
          <button className="btn btn-ghost btn-full" type="button" disabled title="Coming soon">
            Google (coming soon)
          </button>
          <button className="btn btn-ghost btn-full" type="button" disabled title="Coming soon">
            GitHub (coming soon)
          </button>
        </div>
        <p className="small">Social login ist aktuell deaktiviert. Nutze bitte E-Mail und Passwort.</p>
      </form>
    </main>
  );
}
