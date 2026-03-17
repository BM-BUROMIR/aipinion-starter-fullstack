import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  logout: () => {},
});
