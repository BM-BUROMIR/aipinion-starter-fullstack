import { useEffect, useRef } from 'react';
import { setAuthToken } from './auth-utils';

function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('token');
}

/**
 * Handles OAuth callback from auth.aipinion.ru.
 * The auth server redirects here with ?token=<jwt> in the URL.
 * We set it as a cookie and redirect to the app root.
 */
export function AuthCallback() {
  const token = getTokenFromUrl();
  const redirected = useRef(false);

  useEffect(() => {
    if (token && !redirected.current) {
      redirected.current = true;
      setAuthToken(token);
      window.location.replace('/');
    }
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-red-800">
          <h2 className="mb-2 text-lg font-semibold">Authentication Error</h2>
          <p>No token received from auth server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Authenticating...</p>
    </div>
  );
}
