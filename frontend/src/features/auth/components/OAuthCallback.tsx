import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

// Page de callback OAuth pour Google et Facebook.
// Les cookies HttpOnly ont déjà été posés par le backend lors de la
// redirection : il suffit de recharger l'utilisateur pour valider la session.
export function OAuthCallback() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const handleOAuthCallback = async () => {
      try {
        await refreshUser();
        navigate('/');
      } catch (err) {
        console.error("Erreur lors de l'authentification OAuth:", err);
        setError("Erreur lors de l'authentification. Veuillez réessayer.");
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate, refreshUser]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
}
