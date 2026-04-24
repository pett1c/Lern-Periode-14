import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sb-group">OVERVIEW</div>
      <NavLink className="sb-link" to="/dashboard">Dashboard</NavLink>
      <NavLink className="sb-link" to="/events">Events</NavLink>
      <NavLink className="sb-link ai-btn" to="/chat">
        <span><span className="sparkle">✦</span> AI Assistant</span>
      </NavLink>

      <div className="sb-group mt">MY AREA</div>
      <NavLink className="sb-link" to="/tickets">My Tickets</NavLink>
      
      {(user?.role === 'organizer' || user?.role === 'admin') && (
        <NavLink className="sb-link" to="/events/create">+ Create Event</NavLink>
      )}
    </aside>
  );
}

