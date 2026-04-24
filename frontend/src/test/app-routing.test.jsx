import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App';

const mockAuthState = vi.hoisted(() => ({
  user: null,
  booting: false,
  isAuthenticated: false,
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

vi.mock('../pages/Login.jsx', () => ({ default: () => <div>Login Page</div> }));
vi.mock('../pages/Register.jsx', () => ({ default: () => <div>Register Page</div> }));
vi.mock('../pages/Dashboard.jsx', () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock('../pages/EventDetail.jsx', () => ({ default: () => <div>Event Detail Page</div> }));
vi.mock('../pages/CreateEvent.jsx', () => ({ default: () => <div>Create Event Page</div> }));
vi.mock('../pages/MyTickets.jsx', () => ({ default: () => <div>Tickets Page</div> }));
vi.mock('../pages/Chat.jsx', () => ({ default: () => <div>Chat Page</div> }));
vi.mock('../pages/Admin.jsx', () => ({ default: () => <div>Admin Page</div> }));

describe('App route guards', () => {
  test('redirects unauthenticated user to login for protected route', () => {
    mockAuthState.user = null;
    mockAuthState.booting = false;
    mockAuthState.isAuthenticated = false;

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('shows dashboard route for authenticated user', () => {
    mockAuthState.user = { role: 'user' };
    mockAuthState.booting = false;
    mockAuthState.isAuthenticated = true;

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });
});
