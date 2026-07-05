import { useMemo, useState } from 'react';
import { Heart, LogIn } from 'lucide-react';
import type { EventType } from '@/lib/types/EventType';
import { useAuth } from '@/features/auth/AuthContext';
import { EventCard } from '@/features/events_page/components/EventCard';
import { EventModal } from '@/features/events_page/components/EventModal';
import { useFavorites } from './hooks';

// Page /favorites : les événements mis en favori par l'utilisateur
function FavoritesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: favorites, isLoading, error } = useFavorites();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const events = useMemo(
    () =>
      (favorites ?? [])
        .map(favorite => favorite.event)
        .filter((event): event is EventType => !!event),
    [favorites],
  );

  const openAuthModal = () => {
    (document.getElementById('auth_modal') as HTMLDialogElement | null)?.showModal();
  };

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-8 relative">
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <div className="w-full lg:w-[95%] xl:w-[90%] [@media(min-width:1828px)]:w-[80%] mx-auto">
        <div className="flex items-center gap-2 px-3 pt-6 pb-2">
          <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
          <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
          {events.length > 0 && (
            <span className="text-sm text-gray-400">
              ({events.length} {events.length === 1 ? 'événement' : 'événements'})
            </span>
          )}
        </div>

        {/* Non connecté */}
        {!isAuthLoading && !user && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Heart className="h-12 w-12 text-gray-200" />
            <p className="text-gray-600">
              Connectez-vous pour retrouver vos événements favoris.
            </p>
            <button
              onClick={openAuthModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-iakoa-blue hover:opacity-90 transition-opacity cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Se connecter
            </button>
          </div>
        )}

        {(isAuthLoading || (user && isLoading)) && (
          <div className="text-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {user && error && (
          <div className="alert alert-error max-w-md mx-auto mt-6">
            <span>{error.message}</span>
          </div>
        )}

        {/* Liste vide */}
        {user && !isLoading && !error && events.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Heart className="h-12 w-12 text-gray-200" />
            <p className="text-gray-600">Vous n'avez pas encore de favoris.</p>
            <p className="text-sm text-gray-400">
              Cliquez sur le cœur d'un événement pour le retrouver ici.
            </p>
          </div>
        )}

        {/* Grille des favoris */}
        {user && events.length > 0 && (
          <div
            className="grid gap-6 w-full p-3
                       grid-cols-1
                       sm:grid-cols-2
                       lg:grid-cols-3
                       [@media(min-width:1828px)]:grid-cols-4
                       place-items-center"
          >
            {events.map(event => (
              <EventCard key={event.id} event={event} onClick={setSelectedEvent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
