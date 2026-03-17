import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../../src/App';

describe('App', () => {
  beforeEach(() => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    vi.restoreAllMocks();
  });

  it('shows login screen when not authenticated', () => {
    Object.defineProperty(window, 'location', {
      value: { pathname: '/', search: '', origin: 'http://localhost:3000', replace: vi.fn() },
      writable: true,
    });
    render(<App />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('renders auth callback on /auth/callback path', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/auth/callback',
        search: '',
        origin: 'http://localhost:3000',
        replace: vi.fn(),
      },
      writable: true,
    });
    render(<App />);
    expect(screen.getByText('No token received from auth server')).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', () => {
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(
      JSON.stringify({ sub: '1', display_name: 'User', user_type: 'user', apps: {} }),
    );
    document.cookie = `auth_token=${header}.${payload}.sig; path=/`;

    Object.defineProperty(window, 'location', {
      value: { pathname: '/', search: '', origin: 'http://localhost:3000', replace: vi.fn() },
      writable: true,
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    } as Response);

    render(<App />);
    // Both sidebar link and page heading contain "Dashboard"
    const dashboards = screen.getAllByText('Dashboard');
    expect(dashboards.length).toBeGreaterThanOrEqual(1);
  });
});
