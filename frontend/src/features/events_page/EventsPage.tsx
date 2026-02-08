import { EventCard } from './components/EventCard';
import { useRef, useEffect } from 'react';
import { useEvents } from './EventContext';

interface EventsPageProps {
  text?: string;
  showCards?: boolean;
}

// Page d'accueil affichant les événements
// Adapte le contenu selon l'état de connexion
function EventsPage({ text, showCards = true }: EventsPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { events, isLoading, error, fetchEvents } = useEvents();

  useEffect(() => {
    const calculateMargin = () => {
      const header = document.querySelector('[data-header]');
      if (header) {
        const headerHeight = header.clientHeight;
        const margin = Math.max(32, headerHeight + 16);
        if (contentRef.current) {
          contentRef.current.style.marginTop = `${margin}px`;
        }
      }
    };

    calculateMargin();
    window.addEventListener('resize', calculateMargin);
    return () => window.removeEventListener('resize', calculateMargin);
  }, []);

  // Fetch events au montage du composant
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white pt-20 md:pt-8 pb-8 md:pb-8">
      <div ref={contentRef} className="w-full mx-auto">
        {showCards ? (
          <div className="w-full px-4 md:px-8">
            {isLoading && (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {error && (
              <div className="alert alert-error max-w-md mx-auto">
                <span>{error}</span>
              </div>
            )}

            {!isLoading && !error && events.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                Aucun événement disponible pour le moment.
              </div>
            )}

            {!isLoading && !error && events.length > 0 && (
              <div
                className="grid gap-6 w-full mx-auto
                           grid-cols-1
                           sm:grid-cols-2
                           xl:grid-cols-3
                           place-items-center
                           max-w-sm sm:max-w-2xl xl:max-w-6xl"
              >
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center text-lg text-gray-600">{text}</div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
