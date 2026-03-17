import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function ThrowingComponent(): never {
  throw new Error('Test explosion');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders error UI on child error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test explosion')).toBeInTheDocument();
  });

  it('renders custom fallback on error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });
});
