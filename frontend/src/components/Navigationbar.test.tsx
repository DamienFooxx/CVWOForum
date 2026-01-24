import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from './Navigationbar';

describe('Navbar', () => {
  const handleNavigate = vi.fn();
  const handleLogin = vi.fn();
  const handleLogout = vi.fn();

  it('renders Sign In button when not authenticated', () => {
    render(
      <Navbar 
        currentPage="home" 
        onNavigate={handleNavigate} 
        isAuthenticated={false} 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout} 
      />
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByTitle('Logout')).not.toBeInTheDocument();
  });

  it('renders User Profile and Logout when authenticated', () => {
    render(
      <Navbar 
        currentPage="home" 
        onNavigate={handleNavigate} 
        isAuthenticated={true} 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout} 
      />
    );

    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.getByLabelText('User Profile')).toBeInTheDocument();
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
  });

  it('calls onLoginClick when Sign In is clicked', () => {
    render(
      <Navbar 
        currentPage="home" 
        onNavigate={handleNavigate} 
        isAuthenticated={false} 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout} 
      />
    );

    fireEvent.click(screen.getByText('Sign In'));
    expect(handleLogin).toHaveBeenCalled();
  });

  it('calls onLogoutClick when Logout is clicked', () => {
    render(
      <Navbar 
        currentPage="home" 
        onNavigate={handleNavigate} 
        isAuthenticated={true} 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout} 
      />
    );

    fireEvent.click(screen.getByTitle('Logout'));
    expect(handleLogout).toHaveBeenCalled();
  });
});
