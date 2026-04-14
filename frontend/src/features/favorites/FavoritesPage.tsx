import { useEffect, useState } from 'react';
import { Heart, Loader2, LogIn } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { fetchEventById } from '@/lib/services/eventsServices';
import type { EventType } from '@/lib/types/EventType';
import { EventCard } from '@/features/events_page/components/EventCard';
import { EventModal } from '@/features/events_page/components/EventModal';

export default function FavoritesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { ids, isLoading: idsLoading } = useAppSelector((state) => state.favorites);

  const [events, setEvents] = useState<EventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Charge les événements complets à partir des IDs favoris
  useEffect(() => {
    if (!user || ids.length === 0) {
      setEvents([]);
      return;
    }
    setLoadingEvents(true);
    Promise.all(ids.map((id) => fetchEventById(id)))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [ids, user]);

  // ── Garde : non connecté ────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <LogIn size={40} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">Connectez-vous pour voir vos favoris</p>
        <p className="text-sm text-gray-400">Vos événements sauvegardés apparaîtront ici.</p>
      </div>
    );
  }

  // ── Chargement ──────────────────────────────────────────────────────────────
  if (idsLoading || loadingEvents) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-iakoa-blue" />
      </div>
    );
  }

  // ── Aucun favori ────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <Heart size={40} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">Aucun favori pour l'instant</p>
        <p className="text-sm text-gray-400">
          Cliquez sur le cœur d'un événement pour le retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-4 py-8 lg:px-8 lg:py-10">
      <div className="max-w-7xl mx-auto">

        {/* En-tête */}
        <div className="flex items-center gap-3 mb-8">
          <Heart size={22} className="text-red-500" fill="currentColor" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {events.length} événement{events.length > 1 ? 's' : ''} sauvegardé{events.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Grille — même layout que EventsPage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={setSelectedEvent}
            />
          ))}
        </div>
      </div>

      {/* Modal détail */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
