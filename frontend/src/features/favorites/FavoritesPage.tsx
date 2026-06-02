import { useEffect, useMemo, useState } from 'react';
import { Heart, Loader2, LogIn } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { fetchEventById } from '@/lib/services/eventsServices';
import type { EventType } from '@/lib/types/EventType';
import { getCategoryLabel, getCategoryHexColor } from '@/lib/constants/filter-categories';
import { EventModal } from '@/features/events_page/components/EventModal';

// Formate une date d'événement façon « dim 13/09 à 11:16 ».
function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${dayName} ${day}/${month} à ${time}`;
}

// Renvoie le temps restant avant l'événement (ex. « 3 mois », « 5 jours »).
function getRemainingTime(dateString: string): string {
  const diff = new Date(dateString).getTime() - Date.now();
  if (diff <= 0) return 'Événement terminé';
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (months > 0) return `${months} mois`;
  if (days > 0) return `${days} ${days === 1 ? 'jour' : 'jours'}`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  return "Aujourd'hui";
}

// Formate le prix (« Gratuit » ou « À partir de 45€ »).
function formatPrice(pricing: number): string {
  return pricing === 0 ? 'Gratuit' : `À partir de ${pricing / 100}€`;
}

export default function FavoritesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { ids, isLoading: idsLoading } = useAppSelector((state) => state.favorites);

  const [events, setEvents] = useState<EventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // Charge les événements complets à partir des IDs favoris.
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

  // Trie les favoris : événement le plus proche (date la plus tôt) en premier.
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events],
  );

  // ── Garde : non connecté ────────────────────────────────────────────────────
  if (!user) {
    return (
      <div id="favorites-page" className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <LogIn size={40} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">Connectez-vous pour voir vos favoris</p>
        <p className="text-sm text-gray-400">Vos événements sauvegardés apparaîtront ici.</p>
      </div>
    );
  }

  // ── Chargement ──────────────────────────────────────────────────────────────
  if (idsLoading || loadingEvents) {
    return (
      <div id="favorites-page" className="flex-1 flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-iakoa-blue" />
      </div>
    );
  }

  // ── Aucun favori ────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <div id="favorites-page" className="flex-1 flex flex-col items-center justify-center gap-4 py-24 px-4 text-center">
        <Heart size={40} className="text-gray-300" />
        <p className="text-lg font-semibold text-gray-700">Aucun favori pour l'instant</p>
        <p className="text-sm text-gray-400">
          Cliquez sur le cœur d'un événement pour le retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div id="favorites-page" className="flex-1 w-full px-4 py-8 lg:px-8 lg:py-10">
      <div className="max-w-3xl mx-auto">

        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <Heart size={22} className="text-red-500" fill="currentColor" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {events.length} événement{events.length > 1 ? 's' : ''} sauvegardé{events.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Liste verticale de cards */}
        <div className="flex flex-col gap-3">
          {sortedEvents.map((event) => {
            const imageUrl = event.media[0]?.url || `https://picsum.photos/400?random=${event.id}`;
            const { lat, lng } = event.location.coordinates;
            const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
            const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
            return (
              <button
                key={event.id}
                id={`favorite-${event.id}`}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="flex h-[160px] w-full items-stretch overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Image : pleine hauteur de la card, largeur proportionnelle */}
                <img
                  src={imageUrl}
                  alt={event.name}
                  className="h-full w-auto max-w-[240px] shrink-0 object-cover"
                />

                {/* Contenu */}
                <div className="flex flex-1 flex-col justify-center gap-1 px-4 py-3 min-w-0">
                  {/* Ligne 1 : titre + thèmes */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
                    {event.categories.slice(0, 3).map((category) => (
                      <span
                        key={category}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: `${getCategoryHexColor(category)}1A`,
                          color: getCategoryHexColor(category),
                        }}
                      >
                        {getCategoryLabel(category)}
                      </span>
                    ))}
                  </div>
                  {/* Ligne 2 : lieu + date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      {event.location.postalCode} {event.location.city}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{formatEventDate(event.date)}</span>
                  </div>
                  {/* Description (3 lignes max) */}
                  <p className="text-sm text-gray-600 line-clamp-3">{event.description}</p>
                </div>

                {/* Prix + temps restant, centrés verticalement */}
                <div className="flex shrink-0 flex-col items-end justify-center px-4 text-right">
                  <span className="font-semibold whitespace-nowrap text-gray-900">
                    {formatPrice(event.pricing)}
                  </span>
                  <span className="mt-0.5 text-xs text-gray-400">
                    {getRemainingTime(event.date)}
                  </span>
                </div>

                {/* Mini-carte (visuelle, non interactive pour garder la card cliquable) */}
                <iframe
                  title={`Carte de ${event.name}`}
                  src={mapSrc}
                  loading="lazy"
                  className="hidden h-full w-[160px] shrink-0 border-0 pointer-events-none sm:block"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal détail */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
