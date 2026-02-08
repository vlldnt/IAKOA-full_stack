import { EventCard } from './components/EventCard';
import { useRef, useEffect } from 'react';

interface EventsPageProps {
  text?: string;
  showCards?: boolean;
}

// Page d'accueil affichant les événements
// Adapte le contenu selon l'état de connexion
function EventsPage({ text, showCards = false }: EventsPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateMargin = () => {
      const header = document.querySelector('[data-header]');
      if (header) {
        const headerHeight = header.clientHeight;
        // Adapter la marge en fonction de la hauteur du header
        const margin = Math.max(32, headerHeight + 16); // minimum 32px
        if (contentRef.current) {
          contentRef.current.style.marginTop = `${margin}px`;
        }
      }
    };

    calculateMargin();
    window.addEventListener('resize', calculateMargin);
    return () => window.removeEventListener('resize', calculateMargin);
  }, []);

  const cards = [1, 2, 3, 4, 5, 6]; // juste un exemple, tu peux mettre tes vrais events

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-gray-50 to-gray-100 pt-20 md:pt-8 pb-8 md:pb-8 ">
      <div ref={contentRef} className="w-full mx-auto">
        {showCards ? (
          <div className="w-full px-4 md:px-8">
            <div
              className="grid gap-6 w-full max-w-340 mx-auto
                         grid-cols-1
                         sm:grid-cols-2
                         lg:grid-cols-3
                         place-items-center"
            >
              {cards.map((_, idx) => (
                <EventCard key={idx} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-lg text-gray-600">{text}</div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;
