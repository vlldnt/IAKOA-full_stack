import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as companiesService from '@/lib/services/companiesService';
import * as eventsService from '@/lib/services/eventsServices';
import * as usersService from '@/lib/services/usersService';
import type { CreateCompanyPayload } from '@/lib/services/companiesService';
import { useAuth } from '@/features/auth/AuthContext';

// Entreprises de l'utilisateur connecté (organisateur)
export function useMyCompanies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['companies', 'mine', user?.id],
    queryFn: companiesService.fetchMyCompanies,
    enabled: !!user?.isCreator,
    staleTime: 60_000,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companiesService.createCompany(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });
}

// Tous les événements des entreprises de l'utilisateur (tous statuts)
export function useMyEvents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['events', 'mine', user?.id],
    queryFn: eventsService.fetchMyEvents,
    enabled: !!user?.isCreator,
    staleTime: 30_000,
  });
}

// Passe le compte en organisateur puis rafraîchit le contexte d'auth
export function useBecomeCreator() {
  const { user, refreshUser } = useAuth();
  return useMutation({
    mutationFn: () => usersService.updateUser(user!.id, { isCreator: true }),
    onSuccess: () => refreshUser(),
  });
}
