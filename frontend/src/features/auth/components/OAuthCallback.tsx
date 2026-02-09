import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import * as tokenService from '@/lib/services/tokenService';

// Page de callback OAuth pour Google et Facebook
// Récupère les tokens depuis l'URL et connecte l'utilisateur
export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Récupérer les tokens depuis l'URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setError('Erreur lors de l\'authentification. Tokens manquants.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Stocker les tokens
        tokenService.setTokens(accessToken, refreshToken);

        // Récupérer les informations utilisateur
        await refreshUser();

        // Rediriger vers la page d'accueil
        navigate('/');
      } catch (err) {
        console.error('Erreur lors de l\'authentification OAuth:', err);
        setError('Erreur lors de l\'authentification. Veuillez réessayer.');
        tokenService.clearTokens();
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

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
