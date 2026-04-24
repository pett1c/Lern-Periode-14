import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LoginPage from '../pages/Login';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ id: '1' }),
  }),
}));

describe('LoginPage', () => {
  test('keeps social login buttons disabled with coming-soon hint', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /github/i })).toBeDisabled();
    expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0);
  });
});
