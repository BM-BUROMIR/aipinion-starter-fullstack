import { type ReactNode } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">Starter App</h1>
        </div>
        <nav className="flex-1 p-3">
          <a
            href="/"
            className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </a>
        </nav>
        {user && (
          <div className="border-t border-gray-200 p-3">
            <div className="mb-2 px-3 text-xs text-gray-500">{user.display_name}</div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
