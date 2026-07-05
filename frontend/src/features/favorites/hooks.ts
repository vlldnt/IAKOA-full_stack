import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as favoritesService from '@/lib/services/favoritesService';
import type { FavoriteType } from '@/lib/services/favoritesService';
import type { EventType } from '@/lib/types/EventType';
import { useAuth } from '@/features/auth/AuthContext';

// Liste des favoris de l'utilisateur connecté.
// Une seule requête partagée : le bouton cœur et la page /favorites
// lisent le même cache TanStack.
export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => favoritesService.fetchFavorites(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
}

// Set des IDs d'événements favoris pour un lookup O(1) dans les cartes
export function useFavoriteIds(): Set<string> {
  const { data } = useFavorites();
  return useMemo(() => new Set((data ?? []).map(favorite => favorite.eventId)), [data]);
}

interface ToggleVariables {
  event: EventType;
  isFavorite: boolean;
}

// Ajout/retrait d'un favori avec mise à jour optimiste :
// le cœur réagit immédiatement, rollback si le serveur refuse.
export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['favorites', user?.id];

  return useMutation({
    mutationFn: async ({ event, isFavorite }: ToggleVariables) => {
      if (isFavorite) {
        await favoritesService.removeFavorite(user!.id, event.id!);
      } else {
        await favoritesService.addFavorite(user!.id, event.id!);
      }
    },
    onMutate: async ({ event, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FavoriteType[]>(queryKey);

      queryClient.setQueryData<FavoriteType[]>(queryKey, (old = []) =>
        isFavorite
          ? old.filter(favorite => favorite.eventId !== event.id)
          : [
              {
                id: `optimistic-${event.id}`,
                createdAt: new Date().toISOString(),
                userId: user!.id,
                eventId: event.id!,
                event,
              },
              ...old,
            ],
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
