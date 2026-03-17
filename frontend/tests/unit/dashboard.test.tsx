import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../../src/pages/Dashboard';

describe('Dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows health status on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ok' }),
    } as Response);

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Status: ok')).toBeInTheDocument();
    });
  });

  it('shows error on failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error'),
      statusText: 'Server Error',
    } as Response);

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Server Error')).toBeInTheDocument();
    });
  });
});
