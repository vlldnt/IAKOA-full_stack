import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/lib/services/authService';
import * as usersService from '@/lib/services/usersService';
import type { UpdateUserPayload } from '@/lib/services/usersService';
import { useAuth } from '@/features/auth/AuthContext';

// Appareils connectés de l'utilisateur
export function useSessions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: authService.fetchSessionsAPI,
    enabled: !!user,
    staleTime: 30_000,
  });
}

// Déconnexion à distance d'un appareil
export function useRevokeSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSessionAPI(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] }),
  });
}

// Mise à jour du profil (nom, email, mot de passe), puis resynchronisation
// du contexte d'authentification
export function useUpdateProfile() {
  const { user, refreshUser } = useAuth();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersService.updateUser(user!.id, payload),
    onSuccess: () => refreshUser(),
  });
}

// Suppression définitive du compte
export function useDeleteAccount() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => usersService.deleteUser(user!.id),
  });
}
