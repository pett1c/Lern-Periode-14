import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/theme.css';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import EventsPage from './pages/Events.jsx';
import EventDetailPage from './pages/EventDetail.jsx';
import CreateEventPage from './pages/CreateEvent.jsx';
import MyTicketsPage from './pages/MyTickets.jsx';
import ChatPage from './pages/Chat.jsx';
import AdminPage from './pages/Admin.jsx';

function GuardedRoute({ children, roles }) {
  const { user, booting, isAuthenticated } = useAuth();
  if (booting) return <div className="page-shell">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <div className="page-shell">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/dashboard" element={<GuardedRoute><DashboardPage /></GuardedRoute>} />
      <Route path="/events" element={<GuardedRoute><EventsPage /></GuardedRoute>} />
      <Route path="/events/:id" element={<GuardedRoute><EventDetailPage /></GuardedRoute>} />
      <Route
        path="/events/create"
        element={<GuardedRoute roles={['organizer', 'admin']}><CreateEventPage /></GuardedRoute>}
      />
      <Route path="/tickets" element={<GuardedRoute roles={['user']}><MyTicketsPage /></GuardedRoute>} />
      <Route path="/chat" element={<GuardedRoute><ChatPage /></GuardedRoute>} />
      <Route path="/admin" element={<GuardedRoute roles={['admin']}><AdminPage /></GuardedRoute>} />
    </Routes>
  );
}
