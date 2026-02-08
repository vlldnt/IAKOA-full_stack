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
        selectEvent,
        createEvent,
        updateEvent,
        deleteEvent,
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
