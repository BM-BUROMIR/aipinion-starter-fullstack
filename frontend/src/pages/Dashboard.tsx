import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { HealthResponse } from '../types';

export function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HealthResponse>('/health')
      .then(setHealth)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Dashboard</h2>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-2 text-sm font-medium text-gray-500">API Health</h3>
        {error && <p className="text-red-600">{error}</p>}
        {health && <p className="text-lg font-semibold text-green-600">Status: {health.status}</p>}
        {!health && !error && <p className="text-gray-400">Loading...</p>}
      </div>
    </div>
  );
}
