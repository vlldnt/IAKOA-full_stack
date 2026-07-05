import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Filet de sécurité global : une erreur de rendu n'affiche plus une page
// blanche mais un écran de récupération.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur de rendu interceptée:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
            <h1 className="text-xl font-bold mb-2">Oups, quelque chose s'est mal passé</h1>
            <p className="text-gray-600 text-sm mb-6">
              Une erreur inattendue est survenue. Rechargez la page pour continuer.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-iakoa-blue text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
