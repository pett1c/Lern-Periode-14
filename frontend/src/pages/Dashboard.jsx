import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { getEvents } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents().then(setEvents).catch((err) => setError(err.message));
  }, []);

  const totalTicketsSold = events.reduce((acc, ev) => acc + (ev.ticketTypes?.reduce((sum, t) => sum + (t.bookedCount || 0), 0) || 0), 0);
  const totalRevenue = events.reduce((acc, ev) => acc + (ev.ticketTypes?.reduce((sum, t) => sum + (t.bookedCount || 0) * (t.price || 0), 0) || 0), 0);
  
  const formattedRevenue = totalRevenue >= 1000 ? `€${(totalRevenue / 1000).toFixed(1)}K` : `€${totalRevenue}`;
  const formattedTickets = totalTicketsSold >= 1000 ? `${(totalTicketsSold / 1000).toFixed(1)}K` : totalTicketsSold;
  const visitorsCount = (totalTicketsSold * 1.2); // Estimate
  const formattedVisitors = visitorsCount >= 1000 ? `${(visitorsCount / 1000).toFixed(1)}K` : Math.round(visitorsCount);

  const genreCounts = events.reduce((acc, ev) => {
    const g = ev.genre || 'Other';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / (events.length || 1)) * 100)
    }));

  const categoryColors = [
    { fill: 'var(--red)', bg: 'var(--red)', text: 'var(--red)', font: 'bold' },
    { fill: '#4a4540', bg: '#4a4540', text: 'var(--ink-mid)', font: 'normal' },
    { fill: '#8c8580', bg: '#8c8580', text: 'var(--ink-light)', font: 'normal' },
    { fill: 'var(--light3)', bg: '#e0ddd8', text: 'var(--ink-light)', font: 'normal' }
  ];

  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        
        <section className="content-fluid">
          <div className="dashboard-header" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', fontFamily: '"Playfair Display", serif', margin: 0 }}>Dashboard</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(user?.role === 'organizer' || user?.role === 'admin') && (
                <button className="btn btn-ghost" onClick={() => navigate('/events/create')}>+ Create Event</button>
              )}
              <button className="btn btn-red" onClick={() => navigate('/chat')}>✦ AI Assistant</button>
            </div>
          </div>
          {error ? <p className="err">{error}</p> : null}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">EVENTS LIVE</div>
              <div className="stat-val">{events.length}</div>
              <div style={{ color: '#008a00', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>↑ Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">TICKETS SOLD</div>
              <div className="stat-val">{formattedTickets}</div>
              <div style={{ color: '#008a00', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>↑ Real-time data</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">REVENUE</div>
              <div className="stat-val">{formattedRevenue}</div>
              <div style={{ color: '#008a00', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>↑ Platform total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">VISITORS</div>
              <div className="stat-val">{formattedVisitors}</div>
              <div style={{ color: '#008a00', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>↑ Estimated</div>
            </div>
          </div>
          <div className="g2 charts-row">
            <article className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="section-title" style={{ margin: 0 }}>Ticket sales — 7 days</h3>
                <span className="badge red">LIVE</span>
              </div>
              <div className="bar-ch" style={{ height: '120px' }}>
                <div className="bar" style={{ height: '44%' }} />
                <div className="bar" style={{ height: '66%' }} />
                <div className="bar" style={{ height: '50%' }} />
                <div className="bar" style={{ height: '80%' }} />
                <div className="bar" style={{ height: '57%' }} />
                <div className="bar hi" style={{ height: '92%' }} />
                <div className="bar" style={{ height: '70%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.7rem', color: 'var(--ink-light)', marginTop: '8px', textTransform: 'uppercase' }}>
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span style={{ color: 'var(--red)', fontWeight: 'bold' }}>Sa</span><span>Su</span>
              </div>
            </article>
            <article className="card">
              <h3 className="section-title" style={{ marginBottom: '16px', marginTop: 0 }}>Top Categories</h3>
              {topGenres.map((g, idx) => {
                const colorTheme = categoryColors[idx] || categoryColors[categoryColors.length - 1];
                return (
                  <div key={g.name} className="cat-row" style={{ gridTemplateColumns: '80px 1fr 40px' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</span>
                    <div className="prog"><div className="prog-fill" style={{ width: `${g.percent}%`, background: colorTheme.fill }} /></div>
                    <span style={{ fontSize: '0.75rem', color: colorTheme.text, fontWeight: colorTheme.font, textAlign: 'right' }}>{g.percent}%</span>
                  </div>
                );
              })}
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

