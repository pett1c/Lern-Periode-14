import { Link } from 'react-router-dom';

export default function EventCard({ event, onBook }) {
  const sold = event.ticketTypes?.reduce((sum, item) => sum + item.bookedCount, 0) || 0;
  const cap = event.ticketTypes?.reduce((sum, item) => sum + item.capacity, 0) || 1;
  const percent = Math.min(100, Math.round((sold / cap) * 100));

  return (
    <article className="ev-card">
      <div className="ev-image">
        <span className="ev-tag">{event.ticketTypes?.[0]?.name || 'EVENT'}</span>
        <span className="ev-date">{new Date(event.date).toLocaleDateString()}</span>
      </div>
      <div className="ev-body">
        <h3>{event.title}</h3>
        <p>{event.location}</p>
        <div className="ev-row">
          <Link className="btn btn-ghost btn-sm" to={`/events/${event._id}`}>Details</Link>
          {onBook ? (
            <button className="btn btn-red btn-sm" type="button" onClick={() => onBook(event)}>
              Buchen
            </button>
          ) : null}
        </div>
        <div className="prog"><div className="prog-fill" style={{ width: `${percent}%` }} /></div>
      </div>
    </article>
  );
}
