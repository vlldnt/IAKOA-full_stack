import { EventCard } from './components/EventCard';
import { useRef, useEffect, useState } from 'react';
import { useEvents } from './EventContext';

interface EventsPageProps {
  text?: string;
  showCards?: boolean;
}

// Page d'accueil affichant les événements
// Adapte le contenu selon l'état de connexion
function EventsPage({ text, showCards = true }: EventsPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { events = [], isLoading = false, error = null, fetchEventsPaginated, fetchMoreEvents, totalPages = 1 } = useEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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
    if (fetchEventsPaginated) {
      fetchEventsPaginated(1, itemsPerPage);
    }
  }, []);

  // Infinite scroll avec Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          currentPage < totalPages
        ) {
          // Charger la prochaine page
          setCurrentPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [isLoading, currentPage, totalPages]);

  // Quand la page change, charger plus d'événements
  useEffect(() => {
    if (currentPage > 1 && fetchMoreEvents) {
      fetchMoreEvents(currentPage, itemsPerPage);
    }
  }, [currentPage]);

  return (
    <div className="w-full min-h-screen bg-white pt-30 md:pt-4 pb-8 md:pb-8 relative">
      <div ref={contentRef} className="w-full lg:w-[95%] xl:w-[90%] [@media(min-width:1828px)]:w-[80%] mx-auto">
        {showCards ? (
          <div className="w-full">

            {error && (
              <div className="alert alert-error max-w-md mx-auto">
                <span>{error}</span>
              </div>
            )}

            {!error && events.length > 0 && (
              <>
                <div
                  className="grid gap-6 w-full p-3
                             grid-cols-1
                             sm:grid-cols-2
                             lg:grid-cols-3
                             [@media(min-width:1828px)]:grid-cols-4
                             place-items-center"
                >
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Sentinel pour infinite scroll */}
                {currentPage < totalPages && (
                  <div ref={sentinelRef} className="h-20 flex items-center justify-center mt-8 pb-20 lg:pb-8">
                    {isLoading && (
                      <span className="loading loading-spinner loading-lg"></span>
                    )}
                  </div>
                )}

                {/* Message fin de liste */}
                {currentPage === totalPages && events.length > 0 && (
                  <div className="text-center py-8 pb-20 lg:pb-8 text-gray-500">
                    ✓ Plus d'événements à charger
                  </div>
                )}
              </>
            )}

            {isLoading && events.length === 0 && (
              <div className="text-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {!isLoading && !error && events.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                Aucun événement disponible pour le moment.
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
