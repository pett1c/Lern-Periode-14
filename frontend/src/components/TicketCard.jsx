export default function TicketCard({ ticket, onCancel }) {
  const isCancelled = ticket.status === 'CANCELLED';

  return (
    <article className={`ticket ${isCancelled ? 'ticket-muted' : ''}`}>
      <div className="t-stripe" />
      <div className="t-main">
        <div>
          <h4>{ticket.event?.title || 'Event'}</h4>
          <p>{ticket.ticketType} x{ticket.quantity}</p>
        </div>
        <div className="ticket-actions">
          <span className={`pill ${isCancelled ? 'p-ghost' : 'p-red'}`}>{ticket.status}</span>
          {!isCancelled && onCancel ? (
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => onCancel(ticket._id)}>
              Stornieren
            </button>
          ) : null}
        </div>
      </div>
      <div className="t-sep" />
      <div className="t-qr"><div className="qr-box"><div className="qr-sq" /><div /><div /><div className="qr-sq" /></div></div>
    </article>
  );
}
