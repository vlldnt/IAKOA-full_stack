import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { EventType, EventContextType } from "../../lib/types/EventType";
import * as eventsService from "@/lib/services/eventsServices";

const EventContext = createContext<EventContextType | null>(null);

// Contexte d'événements global
// Gère l'état des événements (liste, sélectionné) et les opérations CRUD
// Utilise eventsService pour les appels API
export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [prefetchedPage, setPrefetchedPage] = useState<number | null>(null);
  const [prefetchedData, setPrefetchedData] = useState<EventType[]>([]);

  // Récupère tous les événements publics
  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsService.fetchAllEvents();
      setEvents(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des événements";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupère les événements avec pagination depuis le serveur
  const fetchEventsPaginated = async (page: number = 1, limit: number = 12) => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    try {
      const response = await eventsService.fetchEventsPaginated(page, limit);

      // Attendre au moins 0.5 secondes pour montrer le loader
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      // Gérer les deux formats: tableau direct ou objet paginé
      if (Array.isArray(response)) {
        setEvents(response.slice(0, limit));
        setTotalPages(Math.ceil(response.length / limit));
      } else {
        setEvents(response.data || []);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des événements";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Charge plus d'événements (pour infinite scroll)
  const fetchMoreEvents = async (page: number, limit: number = 12) => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();
    try {
      // Vérifier si les données sont déjà prefetchées
      let response;
      let isFromPrefetch = false;
      if (prefetchedPage === page && prefetchedData.length > 0) {
        // Utiliser les données prefetchées
        response = prefetchedData;
        isFromPrefetch = true;
        setPrefetchedPage(null);
        setPrefetchedData([]);
      } else {
        // Charger les données normalement
        response = await eventsService.fetchEventsPaginated(page, limit);
        isFromPrefetch = false;
      }

      // Attendre au moins 0.5 secondes pour montrer le loader
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      // Gérer les deux formats: tableau direct ou objet paginé
      if (isFromPrefetch) {
        // Les données prefetchées sont déjà slicées et prêtes à utiliser
        const prefetchedEvents = response as EventType[];
        setEvents((prevEvents) => [...prevEvents, ...prefetchedEvents]);
      } else if (Array.isArray(response)) {
        const start = (page - 1) * limit;
        const slicedEvents = response.slice(start, start + limit);
        setEvents((prevEvents) => [...prevEvents, ...slicedEvents]);
        setTotalPages(Math.ceil(response.length / limit));
      } else {
        setEvents((prevEvents) => [...prevEvents, ...(response.data || [])]);
        setTotalPages(response.totalPages || 1);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement des événements";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Prefetch la page suivante en arrière-plan
  const prefetchNextPage = async (nextPage: number, limit: number = 12) => {
    // Ne prefetch QUE si pas déjà prefetchée et si pas au-delà du total
    if (nextPage > totalPages || prefetchedPage === nextPage) return;

    try {
      const response = await eventsService.fetchEventsPaginated(nextPage, limit);

      let data: EventType[] = [];
      if (Array.isArray(response)) {
        const start = (nextPage - 1) * limit;
        data = response.slice(start, start + limit);
      } else {
        data = response.data || [];
      }

      setPrefetchedPage(nextPage);
      setPrefetchedData(data);
    } catch (err) {
      // Silencieusement échouer - ce n'est que du prefetching
      console.error("Prefetch error:", err);
    }
  };

  // Sélectionne un événement en fetchant ses détails par ID
  const selectEvent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const event = await eventsService.fetchEventById(id);
      setSelectedEvent(event);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Erreur lors du chargement de l'événement`;
      setError(message);
      setSelectedEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Crée un nouvel événement
  const createEvent = async (
    eventData: Omit<EventType, "id">,
  ): Promise<EventType> => {
    setIsLoading(true);
    setError(null);
    try {
      const newEvent = await eventsService.createEvent(eventData);
      setEvents([...events, newEvent]);
      return newEvent;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la création de l'événement";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Met à jour un événement existant
  const updateEvent = async (
    id: string,
    eventData: Partial<EventType>,
  ): Promise<EventType> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedEvent = await eventsService.updateEvent(id, eventData);

      // Mettre à jour la liste des événements
      setEvents(
        events.map((event) => (event.id === id ? updatedEvent : event)),
      );

      // Mettre à jour l'événement sélectionné s'il s'agit du même
      if (selectedEvent?.id === id) {
        setSelectedEvent(updatedEvent);
      }

      return updatedEvent;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l'événement";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Supprime un événement
  const deleteEvent = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await eventsService.deleteEvent(id);

      // Supprimer de la liste des événements
      setEvents(events.filter((event) => event.id !== id));

      // Réinitialiser l'événement sélectionné s'il s'agit du même
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'événement";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        selectedEvent,
        isLoading,
        error,
        fetchEvents,
        fetchEventsPaginated,
        fetchMoreEvents,
        totalPages,
        selectEvent,
        createEvent,
        updateEvent,
        deleteEvent,
        prefetchNextPage,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

// Hook pour accéder au contexte des événements dans les composants
export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within EventProvider");
  }
  return context;
}
