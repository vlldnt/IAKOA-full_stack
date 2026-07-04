import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { UserType, AuthContextType } from '../../lib/types/AuthType';
import { isValidUser } from '@/utils/validators';
import * as authService from '@/lib/services/authService';

const AuthContext = createContext<AuthContextType | null>(null);

// Contexte d'authentification global
// Gère l'état de l'utilisateur connecté dans toute l'application.
// L'authentification repose sur des cookies HttpOnly : le client ne
// manipule jamais les tokens, il interroge /users/me pour connaître l'état.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromise = useRef<Promise<void> | null>(null);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    refreshUser();
  }, []);

  // Vérifie et rafraîchit les informations utilisateur.
  // Si l'access token a expiré, tente un refresh (rotation côté serveur) puis réessaie.
  // Empêche les appels concurrents avec refreshPromise.
  const refreshUser = async () => {
    if (refreshPromise.current) {
      return refreshPromise.current;
    }

    refreshPromise.current = (async () => {
      try {
        let userData = await authService.getUserAPI();

        // Access token expiré ou absent : tenter un refresh puis réessayer
        if (!userData) {
          const refreshed = await authService.refreshTokensAPI();
          if (refreshed) {
            userData = await authService.getUserAPI();
          }
        }

        setUser(userData ?? null);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  // Connecte l'utilisateur avec email/password (cookies posés par le serveur)
  const login = async (email: string, password: string) => {
    try {
      const { response, data } = await authService.loginAPI(email, password);

      if (response.ok) {
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
        setUser(data.user);
        return {
          success: true,
          message: `${data.user?.name}, votre compte a été créé avec succés, vous êtes maintenant connecté.`,
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

  // Déconnecte l'utilisateur (révocation de la session côté serveur)
  const logout = async () => {
    await authService.logoutAPI();
    setUser(null);
  };

  // Renouvelle les tokens via le cookie refresh
  // Retourne true si le renouvellement a réussi
  const refreshTokens = async (): Promise<boolean> => {
    const refreshed = await authService.refreshTokensAPI();
    if (!refreshed) {
      setUser(null);
    }
    return refreshed;
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
