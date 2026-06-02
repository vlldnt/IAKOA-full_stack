import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { refreshUser } from '@/store/slices/authSlice';

// Page de callback OAuth pour Google et Facebook.
// Les cookies de session ayant été posés par le backend lors de la redirection,
// il suffit de charger l'utilisateur courant via Redux.
export function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const result = await dispatch(refreshUser()).unwrap();
        if (!result) {
          throw new Error('Session introuvable');
        }
        navigate('/');
      } catch {
        // L'erreur est remontée à l'utilisateur via l'état `error` ci-dessous.
        setError('Erreur lors de l\'authentification. Veuillez réessayer.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate, dispatch]);

  if (error) {
    return (
      <div id="oauth-callback" className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="oauth-callback" className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
}
