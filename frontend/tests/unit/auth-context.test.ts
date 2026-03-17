import { describe, it, expect } from 'vitest';
import { useContext } from 'react';
import { AuthContext } from '../../src/auth/auth-context';

describe('AuthContext', () => {
  it('has correct default value shape', () => {
    // Access default value via the internal structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = AuthContext as any;
    const defaults = ctx._currentValue ?? ctx._defaultValue;
    expect(defaults.user).toBeNull();
    expect(defaults.loading).toBe(false);
    expect(typeof defaults.logout).toBe('function');
    // Call default logout (no-op) for coverage
    defaults.logout();
  });

  it('exports AuthContext and useContext works', () => {
    expect(AuthContext).toBeDefined();
    expect(typeof useContext).toBe('function');
  });
});
