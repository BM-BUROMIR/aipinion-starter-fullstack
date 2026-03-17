import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch, ApiError } from '../../src/api/client';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches JSON from API with credentials', async () => {
    const mockData = { status: 'ok' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiFetch('/health');
    expect(result).toEqual(mockData);

    expect(fetch).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('throws ApiError on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
      statusText: 'Unauthorized',
    } as Response);

    await expect(apiFetch('/protected')).rejects.toThrow(ApiError);
    await expect(apiFetch('/protected')).rejects.toMatchObject({
      status: 401,
      message: 'Unauthorized',
    });
  });

  it('handles text() failure gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('stream error')),
      statusText: 'Internal Server Error',
    } as Response);

    await expect(apiFetch('/broken')).rejects.toThrow('Internal Server Error');
  });

  it('passes custom options', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await apiFetch('/test', { method: 'POST', body: '{}' });
    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'POST', body: '{}' }),
    );
  });
});
