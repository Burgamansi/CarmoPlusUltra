import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // explicit props & state fields helps TypeScript recognise them
  public props: ErrorBoundaryProps;
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error details:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-carmel-beige p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Erro na Aplicação</h2>
            <p className="text-carmel-brown mb-4">{this.state.error?.message}</p>
            <details className="text-left text-xs text-carmel-brown/60 bg-gray-100 p-3 rounded mb-4">
              <summary className="cursor-pointer font-bold">Detalhes Técnicos</summary>
              <pre className="mt-2 overflow-auto">{this.state.error?.stack}</pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-carmel-brown text-carmel-beige px-4 py-2 rounded font-bold"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
