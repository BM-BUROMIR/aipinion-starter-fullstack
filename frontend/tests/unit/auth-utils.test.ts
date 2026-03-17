import { describe, it, expect, afterEach } from 'vitest';
import {
  getCookie,
  deleteCookie,
  setCookie,
  decodeJwtPayload,
  getInitialUser,
  clearAuthCookie,
  setAuthToken,
} from '../../src/auth/auth-utils';

describe('auth-utils', () => {
  afterEach(() => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'test=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  });

  it('getCookie returns null for missing cookie', () => {
    expect(getCookie('nonexistent')).toBeNull();
  });

  it('getCookie returns cookie value', () => {
    document.cookie = 'test=hello; path=/';
    expect(getCookie('test')).toBe('hello');
  });

  it('deleteCookie removes a cookie', () => {
    document.cookie = 'test=value; path=/';
    deleteCookie('test');
    expect(getCookie('test')).toBeNull();
  });

  it('setCookie sets a cookie with max-age', () => {
    setCookie('test', 'myval', 3600);
    expect(getCookie('test')).toBe('myval');
  });

  it('decodeJwtPayload decodes valid JWT', () => {
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(JSON.stringify({ sub: '1', display_name: 'A', user_type: 'u', apps: {} }));
    const result = decodeJwtPayload(`${header}.${payload}.sig`);
    expect(result).toEqual({ sub: '1', display_name: 'A', user_type: 'u', apps: {} });
  });

  it('decodeJwtPayload returns null for token without payload', () => {
    expect(decodeJwtPayload('onlyheader')).toBeNull();
  });

  it('decodeJwtPayload returns null for malformed base64', () => {
    expect(decodeJwtPayload('header.!!!invalid!!!.sig')).toBeNull();
  });

  it('getInitialUser returns null when no cookie', () => {
    expect(getInitialUser()).toBeNull();
  });

  it('getInitialUser returns user from cookie', () => {
    const header = btoa(JSON.stringify({ alg: 'RS256' }));
    const payload = btoa(JSON.stringify({ sub: '1', display_name: 'B', user_type: 'u', apps: {} }));
    document.cookie = `auth_token=${header}.${payload}.sig; path=/`;
    const user = getInitialUser();
    expect(user?.display_name).toBe('B');
  });

  it('clearAuthCookie removes auth_token', () => {
    document.cookie = 'auth_token=xyz; path=/';
    clearAuthCookie();
    expect(getCookie('auth_token')).toBeNull();
  });

  it('setAuthToken sets auth_token cookie', () => {
    setAuthToken('mytoken');
    expect(getCookie('auth_token')).toBe('mytoken');
  });
});
