import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '../../src/components/AppShell';
import { AuthContext } from '../../src/auth/auth-context';

describe('AppShell', () => {
  it('renders sidebar and content', () => {
    render(
      <AuthContext.Provider value={{ user: null, loading: false, logout: () => {} }}>
        <AppShell>
          <p>Page content</p>
        </AppShell>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('Starter App')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('shows user name and sign out when authenticated', () => {
    const user = { sub: '1', display_name: 'Alice', user_type: 'user', apps: {} };
    render(
      <AuthContext.Provider value={{ user, loading: false, logout: () => {} }}>
        <AppShell>
          <p>Content</p>
        </AppShell>
      </AuthContext.Provider>,
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});
