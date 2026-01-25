import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { PLACEHOLDERS, BUTTONS } from '../constants/strings';

const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('LoginPage', () => {
  const handleLoginSuccess = vi.fn();
  const handleNavigateSignup = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form', () => {
    render(<LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToSignup={handleNavigateSignup} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(PLACEHOLDERS.LOGIN_USERNAME)).toBeInTheDocument();
  });

  it('submits username and calls onLoginSuccess', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-jwt', username: 'testuser', user_id: 123 }),
    });

    render(<LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToSignup={handleNavigateSignup} />);

    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.LOGIN_USERNAME), { target: { value: 'testuser' } });
    fireEvent.click(screen.getByRole('button', { name: BUTTONS.CONTINUE }));

    await waitFor(() => {
      expect(handleLoginSuccess).toHaveBeenCalledWith('fake-jwt', 'testuser', 123);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'testuser' }),
      })
    );
  });

  it('displays error message on failure', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid user' }),
    });

    render(<LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToSignup={handleNavigateSignup} />);

    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDERS.LOGIN_USERNAME), { target: { value: 'baduser' } });
    fireEvent.click(screen.getByRole('button', { name: BUTTONS.CONTINUE }));

    await waitFor(() => {
      expect(screen.getByText('Invalid user')).toBeInTheDocument();
    });
  });
});
