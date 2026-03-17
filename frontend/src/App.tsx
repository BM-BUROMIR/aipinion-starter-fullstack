import { AuthProvider } from './auth/AuthProvider';
import { AuthCallback } from './auth/AuthCallback';
import { LoginScreen } from './auth/LoginScreen';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './hooks/use-auth';

function AppRoutes() {
  const { user } = useAuth();
  const path = window.location.pathname;

  if (path === '/auth/callback') return <AuthCallback />;
  if (!user) return <LoginScreen />;

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
