import { useState } from 'react';
import { askChat } from '../../api/chatApi';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = ['Rock-Konzert diesen Winter', 'Events in Berlin', 'Techno-Festival', 'Kostenlose Events'];

export default function ChatWindow() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ich helfe dir passende Events zu finden.' },
  ]);

  async function onSubmit(event) {
    event.preventDefault();
    if (!query.trim()) return;
    const value = query.trim();
    setMessages((prev) => [...prev, { role: 'user', text: value }]);
    setQuery('');
    setLoading(true);
    try {
      const data = await askChat(value);
      setMessages((prev) => [...prev, { role: 'assistant', text: data?.answer || 'Keine Antwort erhalten.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', text: err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-layout">
      <aside className="chat-sidebar">
        <button type="button" className="btn btn-red btn-full btn-sm">+ Neue Unterhaltung</button>
      </aside>
      <div className="chat-main">
        <div className="chat-header"><div className="av-ai">✦</div> AI Assistent</div>
        <div className="chat-messages">
          {messages.map((m, i) => <MessageBubble key={`${m.role}-${i}`} role={m.role} text={m.text} />)}
          {loading ? <MessageBubble role="assistant" text="Denke nach..." /> : null}
        </div>
        <div className="suggestions">{SUGGESTIONS.map((s) => <button key={s} type="button" className="suggest-chip" onClick={() => setQuery(s)}>{s}</button>)}</div>
        <form className="chat-input" onSubmit={onSubmit}>
          <input className="fi" value={query} onChange={(e) => setQuery(e.target.value)} placeholder='z.B. "Ich suche Techno in Berlin"' />
          <button type="submit" className="btn btn-red btn-sm" disabled={loading}>Senden</button>
        </form>
      </div>
    </section>
  );
}
