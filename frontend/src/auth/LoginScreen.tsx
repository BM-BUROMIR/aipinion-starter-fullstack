import { LogIn } from 'lucide-react';

const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || 'https://auth.aipinion.ru';
const APP_SLUG = import.meta.env.VITE_APP_SLUG || 'starter';

export function LoginScreen() {
  const callbackUrl = `${window.location.origin}/auth/callback`;
  const authUrl = `${AUTH_SERVER_URL}/auth/telegram?app=${APP_SLUG}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Welcome</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to continue</p>
        <a
          href={authUrl}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <LogIn size={18} />
          Sign in with Telegram
        </a>
      </div>
    </div>
  );
}
