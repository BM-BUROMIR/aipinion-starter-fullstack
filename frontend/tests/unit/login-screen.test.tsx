import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { LoginScreen } from '../../src/auth/LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => {
    cleanup();
  });

  it('renders sign in button with correct auth URL', () => {
    const { unmount } = render(<LoginScreen />);
    const link = screen.getByRole('link', { name: /sign in with telegram/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toContain('auth.aipinion.ru');
    expect(link.getAttribute('href')).toContain('redirect_uri=');
    unmount();
  });

  it('renders welcome heading', () => {
    const { unmount } = render(<LoginScreen />);
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    unmount();
  });
});
