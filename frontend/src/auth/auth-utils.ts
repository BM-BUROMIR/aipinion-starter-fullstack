import type { User } from '../types';

const COOKIE_NAME = 'auth_token';

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

export function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function decodeJwtPayload(token: string): User | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as User;
  } catch {
    return null;
  }
}

export function getInitialUser(): User | null {
  const token = getCookie(COOKIE_NAME);
  if (!token) return null;
  return decodeJwtPayload(token);
}

export function clearAuthCookie(): void {
  deleteCookie(COOKIE_NAME);
}

export function setAuthToken(token: string): void {
  setCookie(COOKIE_NAME, token, 60 * 60 * 24 * 7);
}
