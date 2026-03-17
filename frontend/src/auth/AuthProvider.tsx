import { useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import { clearAuthCookie, getInitialUser } from './auth-utils';
import type { User } from '../types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const logout = useMemo(
    () => () => {
      clearAuthCookie();
      setUser(null);
    },
    [],
  );

  const value = useMemo(() => ({ user, loading: false, logout }), [user, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
