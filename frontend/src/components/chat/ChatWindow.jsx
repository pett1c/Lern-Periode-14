import { useState, useEffect } from 'react';
import { askChat } from '../../api/chatApi';
import MessageBubble from './MessageBubble';

const SUGGESTIONS = ['Rock concert this winter', 'Events in Berlin', 'Techno festival', 'Free events'];

export default function ChatWindow() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eventify_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      setChats(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
      else createNewChat();
    } else {
      createNewChat();
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('eventify_chats', JSON.stringify(chats));
    }
  }, [chats]);

  const activeChat = chats.find(c => c.id === activeId) || null;

  function createNewChat() {
    const newChat = { id: Date.now().toString(), messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveId(newChat.id);
  }

  async function onSubmit(event) {
    if (event) event.preventDefault();
    if (!query.trim() || !activeId) return;
    const value = query.trim();
    
    setChats(prev => prev.map(c => 
      c.id === activeId ? { ...c, messages: [...c.messages, { role: 'user', text: value }] } : c
    ));
    setQuery('');
    setLoading(true);
    
    try {
      const data = await askChat(value);
      setChats(prev => prev.map(c => 
        c.id === activeId ? { ...c, messages: [...c.messages, { role: 'assistant', text: data?.answer || 'No response.' }] } : c
      ));
    } catch (err) {
      setChats(prev => prev.map(c => 
        c.id === activeId ? { ...c, messages: [...c.messages, { role: 'assistant', text: err.message }] } : c
      ));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-layout">
      <aside className="chat-sidebar">
        <div style={{ padding: '4px 8px 16px', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--red)' }}>HISTORY</div>
        <button type="button" className="btn btn-red btn-full btn-sm" onClick={createNewChat} style={{ marginBottom: '16px' }}>+ New Chat</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '400px' }}>
          {chats.map((c, i) => (
            <div 
              key={c.id} 
              onClick={() => setActiveId(c.id)}
              style={{ padding: '8px', background: c.id === activeId ? 'var(--white)' : 'transparent', border: c.id === activeId ? '1px solid var(--border)' : '1px solid transparent', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {c.messages.length > 0 ? c.messages[0].text : `New Chat`}
            </div>
          ))}
        </div>
      </aside>
      <div className="chat-main">
        <div className="chat-header">
          <div className="av-ai">✦</div> 
          <span style={{ fontWeight: 'bold', marginLeft: '6px' }}>AI Assistant</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', background: 'var(--off-white)' }}>GPT-POWERED</span>
        </div>
        
        <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeChat?.messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--ink-light)', padding: '40px' }}>
              <div className="av-ai" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '1.5rem' }}>✦</div>
              <h3>How can I help you today?</h3>
              <p>Ask me to find events, filter by categories, or suggest activities.</p>
            </div>
          ) : (
            activeChat?.messages.map((m, i) => <MessageBubble key={`${m.role}-${i}`} role={m.role} text={m.text} />)
          )}
          {loading ? <MessageBubble role="assistant" text="loading_animation" /> : null}
        </div>
        
        <div className="suggestions">
          {SUGGESTIONS.map((s) => <button key={s} type="button" className="suggest-chip" onClick={() => setQuery(s)}>{s}</button>)}
        </div>
        <form className="chat-input" onSubmit={onSubmit}>
          <input className="fi" value={query} onChange={(e) => setQuery(e.target.value)} placeholder='e.g., "Find a tech event next week"' />
          <button type="submit" className="btn btn-red btn-sm" disabled={loading} style={{ whiteSpace: 'nowrap' }}>Send →</button>
        </form>
      </div>
    </section>
  );
}
