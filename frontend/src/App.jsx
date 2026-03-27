import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'eventify_token';
const USER_STORAGE_KEY = 'eventify_user';

function parseApiError(payload, fallback = 'Request failed.') {
  if (!payload) {
    return fallback;
  }

  if (payload.error?.details?.length) {
    const detailText = payload.error.details
      .map((item) => `${item.path || 'field'}: ${item.message}`)
      .join(' | ');
    return `${payload.message || fallback} (${detailText})`;
  }

  return payload.message || fallback;
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseApiError(payload, `HTTP ${response.status}`));
  }

  return payload;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('auth');

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    standardPrice: 50,
    standardCapacity: 100,
    vipPrice: 120,
    vipCapacity: 20,
  });
  const [bookForm, setBookForm] = useState({
    eventId: '',
    ticketType: 'STANDARD',
    quantity: 1,
  });

  const isAuthenticated = Boolean(token && user);
  const role = user?.role || null;

  const canCreateEvent = useMemo(() => role === 'organizer' || role === 'admin', [role]);
  const canBookTicket = useMemo(() => role === 'user', [role]);

  useEffect(() => {
    if (!token) {
      return;
    }

    apiRequest('/auth/me', { token })
      .then((payload) => {
        const me = payload?.data?.user;
        if (me) {
          setUser(me);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
        }
      })
      .catch(() => {
        clearSession();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEvents() {
    setLoading(true);
    setErrorMessage('');
    try {
      const payload = await apiRequest('/events', { token });
      setEvents(payload?.data?.events || []);
      setStatusMessage(`Loaded ${payload?.data?.events?.length || 0} events.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMyTickets() {
    if (!canBookTicket) {
      setErrorMessage('Only users can load "my tickets".');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const payload = await apiRequest('/tickets/me', { token });
      setMyTickets(payload?.data?.tickets || []);
      setStatusMessage(`Loaded ${payload?.data?.tickets?.length || 0} tickets.`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function persistSession(sessionToken, sessionUser) {
    setToken(sessionToken);
    setUser(sessionUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionUser));
  }

  function clearSession() {
    setToken('');
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  async function onRegister(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const payload = await apiRequest('/auth/register', {
        method: 'POST',
        body: registerForm,
      });
      persistSession(payload?.data?.token, payload?.data?.user);
      setStatusMessage('Registration successful. You are now logged in.');
      setActiveTab('events');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onLogin(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: loginForm,
      });
      persistSession(payload?.data?.token, payload?.data?.user);
      setStatusMessage('Login successful.');
      setActiveTab('events');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onCreateEvent(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await apiRequest('/events', {
        method: 'POST',
        token,
        body: {
          title: eventForm.title,
          description: eventForm.description,
          date: eventForm.date,
          location: eventForm.location,
          ticketTypes: [
            {
              name: 'STANDARD',
              price: Number(eventForm.standardPrice),
              capacity: Number(eventForm.standardCapacity),
            },
            {
              name: 'VIP',
              price: Number(eventForm.vipPrice),
              capacity: Number(eventForm.vipCapacity),
            },
          ],
        },
      });

      setStatusMessage('Event created successfully.');
      await loadEvents();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onBookTicket(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await apiRequest('/tickets/book', {
        method: 'POST',
        token,
        body: {
          eventId: bookForm.eventId,
          ticketType: bookForm.ticketType,
          quantity: Number(bookForm.quantity),
        },
      });
      setStatusMessage('Ticket booked successfully.');
      await loadMyTickets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function onCancelTicket(ticketId) {
    setLoading(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await apiRequest(`/tickets/${ticketId}/cancel`, {
        method: 'PATCH',
        token,
      });
      setStatusMessage('Ticket cancelled successfully.');
      await loadMyTickets();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Eventify Frontend Integration</h1>
        <p>Connected to: <code>{API_BASE_URL}</code></p>
      </header>

      <nav className="tabs">
        <button type="button" onClick={() => setActiveTab('auth')}>Auth</button>
        <button type="button" onClick={() => setActiveTab('events')}>Events</button>
        <button type="button" onClick={() => setActiveTab('tickets')}>Tickets</button>
      </nav>

      <section className="status-line">
        {isAuthenticated ? (
          <p>
            Logged in as <strong>{user.name}</strong> ({user.role}) {' '}
            <button type="button" onClick={clearSession}>Logout</button>
          </p>
        ) : (
          <p>Not logged in.</p>
        )}
        {statusMessage ? <p className="ok">{statusMessage}</p> : null}
        {errorMessage ? <p className="err">{errorMessage}</p> : null}
      </section>

      {activeTab === 'auth' && (
        <div className="grid">
          <form className="card" onSubmit={onRegister}>
            <h2>Register</h2>
            <input
              placeholder="Name"
              value={registerForm.name}
              onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password (min 8)"
              value={registerForm.password}
              onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              required
            />
            <select
              value={registerForm.role}
              onChange={(event) => setRegisterForm({ ...registerForm, role: event.target.value })}
            >
              <option value="user">user</option>
              <option value="organizer">organizer</option>
            </select>
            <button type="submit" disabled={loading}>Register</button>
          </form>

          <form className="card" onSubmit={onLogin}>
            <h2>Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              required
            />
            <button type="submit" disabled={loading}>Login</button>
          </form>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid">
          <div className="card">
            <h2>Events</h2>
            <button type="button" onClick={loadEvents} disabled={loading}>Load Events</button>
            <ul>
              {events.map((eventItem) => (
                <li key={eventItem._id}>
                  <strong>{eventItem.title}</strong> - {eventItem.location}
                  <br />
                  <small>{new Date(eventItem.date).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>

          <form className="card" onSubmit={onCreateEvent}>
            <h2>Create Event (Organizer/Admin)</h2>
            <input
              placeholder="Title"
              value={eventForm.title}
              onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={eventForm.description}
              onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
              required
            />
            <input
              type="datetime-local"
              value={eventForm.date}
              onChange={(event) => setEventForm({ ...eventForm, date: event.target.value })}
              required
            />
            <input
              placeholder="Location"
              value={eventForm.location}
              onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
              required
            />
            <div className="row">
              <input
                type="number"
                min="0"
                placeholder="STANDARD price"
                value={eventForm.standardPrice}
                onChange={(event) => setEventForm({ ...eventForm, standardPrice: event.target.value })}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="STANDARD capacity"
                value={eventForm.standardCapacity}
                onChange={(event) => setEventForm({ ...eventForm, standardCapacity: event.target.value })}
                required
              />
            </div>
            <div className="row">
              <input
                type="number"
                min="0"
                placeholder="VIP price"
                value={eventForm.vipPrice}
                onChange={(event) => setEventForm({ ...eventForm, vipPrice: event.target.value })}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="VIP capacity"
                value={eventForm.vipCapacity}
                onChange={(event) => setEventForm({ ...eventForm, vipCapacity: event.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading || !canCreateEvent}>Create Event</button>
          </form>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="grid">
          <form className="card" onSubmit={onBookTicket}>
            <h2>Book Ticket (User)</h2>
            <input
              placeholder="Event ID"
              value={bookForm.eventId}
              onChange={(event) => setBookForm({ ...bookForm, eventId: event.target.value })}
              required
            />
            <select
              value={bookForm.ticketType}
              onChange={(event) => setBookForm({ ...bookForm, ticketType: event.target.value })}
            >
              <option value="STANDARD">STANDARD</option>
              <option value="VIP">VIP</option>
            </select>
            <input
              type="number"
              min="1"
              max="20"
              value={bookForm.quantity}
              onChange={(event) => setBookForm({ ...bookForm, quantity: event.target.value })}
              required
            />
            <button type="submit" disabled={loading || !canBookTicket}>Book Ticket</button>
          </form>

          <div className="card">
            <h2>My Tickets</h2>
            <button type="button" onClick={loadMyTickets} disabled={loading || !canBookTicket}>
              Load My Tickets
            </button>
            <ul>
              {myTickets.map((ticket) => (
                <li key={ticket._id}>
                  <strong>{ticket.ticketType}</strong> x{ticket.quantity} ({ticket.status})
                  <br />
                  <small>Event: {ticket.event?.title || ticket.event}</small>
                  {ticket.status !== 'CANCELLED' ? (
                    <>
                      <br />
                      <button
                        type="button"
                        onClick={() => onCancelTicket(ticket._id)}
                        disabled={loading}
                      >
                        Cancel Ticket
                      </button>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
