import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { AuthProvider } from '../../src/auth/AuthProvider';
import { useAuth } from '../../src/hooks/use-auth';

function TestConsumer() {
  const { user, loading, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.display_name : 'null'}</span>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

describe('AuthProvider', () => {
  afterEach(() => {
    cleanup();
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('returns null user when no cookie', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('decodes user from auth_token cookie', () => {
    const token = fakeJwt({ sub: '123', display_name: 'Test', user_type: 'user', apps: {} });
    document.cookie = `auth_token=${token}; path=/`;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('Test');
  });

  it('handles invalid JWT gracefully', () => {
    document.cookie = 'auth_token=not-a-jwt; path=/';

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('logout clears user', () => {
    const token = fakeJwt({ sub: '1', display_name: 'X', user_type: 'u', apps: {} });
    document.cookie = `auth_token=${token}; path=/`;

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user').textContent).toBe('X');

    act(() => {
      screen.getByText('logout').click();
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
  });
});
