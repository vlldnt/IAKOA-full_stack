import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserType, AuthContextType } from '../../lib/types/AuthType';
import { isValidUser } from '@/utils/validators';
import * as tokenService from '@/lib/services/tokenService';
import * as authService from '@/lib/services/authService';

const AuthContext = createContext<AuthContextType | null>(null);

// Contexte d'authentification global
// Gère l'état de l'utilisateur connecté dans toute l'application
// Utilise authService pour les appels API et tokenService pour les tokens
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromise = useRef<Promise<void> | null>(null);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    refreshUser();
  }, []);

  // Vérifie et rafraîchit les informations utilisateur au chargement
  // Gère automatiquement le renouvellement des tokens expirés
  // Empêche les appels concurrents avec refreshPromise
  const refreshUser = async () => {
    // Empêcher les appels concurrents (race condition)
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    // Créer une nouvelle promesse pour ce refresh
    refreshPromise.current = (async () => {
      let token = tokenService.getAccessToken();

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Tenter de récupérer les infos utilisateur
        let userData = await authService.getUserAPI(token);

        // Si le token d'accès a expiré (null), essayer de le rafraîchir
        if (!userData) {
          const refreshed = await refreshTokens();
          if (refreshed) {
            // Récupérer le nouveau token et réessayer
            token = tokenService.getAccessToken();
            if (token) {
              userData = await authService.getUserAPI(token);
            }
          }
        }

        if (userData) {
          setUser(userData);
        } else {
          tokenService.clearTokens();
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        tokenService.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  // Connecte l'utilisateur avec email/password et stocke les tokens
  const login = async (email: string, password: string) => {
    try {
      const { response, data } = await authService.loginAPI(email, password);

      if (response.ok) {
        tokenService.setTokens(data.access_token, data.refresh_token);
        setUser(data.user);
        return { success: true, message: `User: ${JSON.stringify(data.user.name)} bien connecté.` };
      }
      return {
        success: false,
        error: data.message || 'La connection a échoué.',
      };
    } catch {
      return {
        success: false,
        error: 'Problème de réseau.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Valide les données, crée un compte et connecte l'utilisateur
  const register = async (name: string, email: string, password: string) => {
    const validation = isValidUser(name, email, password);
    if (!validation.valid) {
      return { success: false, error: validation.errors.join(', ') };
    }
    try {
      const { response, data } = await authService.registerAPI(name, email, password);
      if (response.ok) {
        tokenService.setTokens(data.access_token, data.refresh_token);
        setUser(data.user);
        return {
          success: true,
          message: `${data.name}, votre compte a été créé avec succés, vous êtes maintenant connecté.`,
        };
      }
      return {
        success: false,
        error: data.message || 'Impossibilité de créer un compte.',
      };
    } catch {
      return {
        success: false,
        error: 'Problème de réseau',
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnecte l'utilisateur et supprime les tokens
  const logout = async () => {
    const token = tokenService.getAccessToken();
    if (token) {
      await authService.logoutAPI(token);
    }
    tokenService.clearTokens();
    setUser(null);
  };

  // Renouvelle les tokens via le refresh token
  // Retourne true si le renouvellement a réussi
  const refreshTokens = async (): Promise<boolean> => {
    const currentRefreshToken = tokenService.getRefreshToken();
    if (!currentRefreshToken) return false;

    try {
      const data = await authService.refreshTokensAPI(currentRefreshToken);

      if (data) {
        tokenService.setTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch {
      console.error('Échec du renouvellement des tokens');
    }

    tokenService.clearTokens();
    setUser(null);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour accéder au contexte d'auth dans les composants
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
