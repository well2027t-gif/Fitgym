/**
 * FitPro — ErrorBoundary
 * Design: Premium Dark Fitness
 * Fallback de erro global com estilo consistente.
 */

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex items-center justify-center min-h-screen p-8"
          style={{ background: '#0d0d0f' }}
        >
          <div className="flex flex-col items-center w-full max-w-md text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
            >
              <AlertTriangle size={40} style={{ color: '#ef4444' }} />
            </div>

            <h2
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              Ocorreu um erro inesperado
            </h2>

            <p
              className="text-sm mb-6"
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}
            >
              Algo deu errado. Tente recarregar a página.
            </p>

            <div
              className="p-4 w-full rounded-xl overflow-auto mb-6 text-left"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <pre
                className="text-xs whitespace-pre-wrap"
                style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}
              >
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
              style={{
                background: 'var(--theme-accent, #22c55e)',
                color: '#0d0d0f',
                fontFamily: 'Space Grotesk',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.25)',
              }}
            >
              <RotateCcw size={16} />
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
