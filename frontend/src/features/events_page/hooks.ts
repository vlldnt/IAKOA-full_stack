import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import * as eventsService from '@/lib/services/eventsServices';
import type { EventFilterParams } from '@/lib/services/eventsServices';
import type { EventType } from '@/lib/types/EventType';

export const EVENTS_PAGE_SIZE = 12;

// Liste paginée (infinite scroll). Le cache est indexé par les filtres :
// revenir à des filtres déjà vus est instantané, TanStack gère le
// rafraîchissement en arrière-plan.
export function useInfiniteEvents(filters: EventFilterParams | undefined) {
  return useInfiniteQuery({
    queryKey: ['events', 'list', filters ?? 'all'],
    queryFn: ({ pageParam }) =>
      eventsService.fetchEventsPaginated(pageParam, EVENTS_PAGE_SIZE, filters),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
  });
}

// Événements pour la carte (une seule grosse page, rayon large)
export function useEventsForMap(filters: EventFilterParams, enabled: boolean) {
  return useQuery({
    queryKey: ['events', 'map', filters],
    queryFn: () => eventsService.fetchEventsPaginated(1, 500, filters),
    enabled,
    staleTime: 60_000,
  });
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => eventsService.fetchEventById(id!),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventData: Omit<EventType, 'id'>) => eventsService.createEvent(eventData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventType> }) =>
      eventsService.updateEvent(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}
