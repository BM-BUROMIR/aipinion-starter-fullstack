import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md rounded-lg border border-red-300 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-800">Something went wrong</h2>
            <p className="text-sm text-red-600">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
