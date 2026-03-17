import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthCallback } from '../../src/auth/AuthCallback';

describe('AuthCallback', () => {
  beforeEach(() => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    vi.restoreAllMocks();
  });

  it('shows error when no token in URL', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '', pathname: '/auth/callback', replace: vi.fn() },
      writable: true,
    });

    render(<AuthCallback />);
    expect(screen.getByText('No token received from auth server')).toBeInTheDocument();
  });

  it('sets cookie and redirects when token present', () => {
    const replaceFn = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { search: '?token=abc123', pathname: '/auth/callback', replace: replaceFn },
      writable: true,
    });

    render(<AuthCallback />);
    expect(document.cookie).toContain('auth_token=abc123');
    expect(replaceFn).toHaveBeenCalledWith('/');
  });
});
