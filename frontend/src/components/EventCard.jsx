import { Link } from 'react-router-dom';
import React from 'react';

export default function EventCard({ event, onBook }) {
  const sold = event.ticketTypes?.reduce((sum, item) => sum + item.bookedCount, 0) || 0;
  const cap = event.ticketTypes?.reduce((sum, item) => sum + item.capacity, 0) || 1;
  const percent = Math.min(100, Math.round((sold / cap) * 100));

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
  const displayImage = event.imageUrl ? { backgroundImage: `url(${event.imageUrl})`, backgroundSize: 'cover' } : bgStyle;

  return (
    <article className="ev-card">
      <div className="ev-image" style={displayImage}>
        <span className="ev-tag" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--ink)' }}>{event.genre || 'EVENT'}</span>
        <span className="ev-date" style={{ fontWeight: 'bold' }}>
          {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
        </span>
      </div>
      <div className="ev-body">
        <h3 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h3>
        <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.location}</p>
        <div className="ev-row">
          <div style={{ flex: 1 }}>
            <div className="prog"><div className="prog-fill" style={{ width: `${percent}%` }} /></div>
            <p className="small" style={{ marginTop: '4px', margin: 0, color: percent > 80 ? 'var(--red)' : 'var(--ink-light)' }}>
              {percent}% {percent > 80 ? '– Almost full!' : 'sold'}
            </p>
          </div>
          {onBook ? (
            <button className="btn btn-red btn-sm" type="button" onClick={() => onBook(event)}>
              Book
            </button>
          ) : (
            <Link className="btn btn-ghost btn-sm" to={`/events/${event._id}`}>Details</Link>
          )}
        </div>
      </div>
    </article>
  );
}
