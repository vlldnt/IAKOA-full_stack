import { Calendar, Euro, Clock, MapPin, Share2, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { EventType } from '@/lib/types/EventType';
import {
  getCategoryLabel,
  getCategoryHexColor,
  getCategoryShadowColor,
} from '@/lib/constants/filter-categories';

interface EventCardProps {
  event: EventType;
  onClick?: (event: EventType) => void;
}

function getRemainingTime(dateString: string) {
  const now = new Date().getTime();
  const eventTime = new Date(dateString).getTime();
  const diff = eventTime - now;

  if (diff <= 0) return 'Événement terminé';

  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (months > 0) return `${months} mois`;
  if (days > 0) return `${days} ${days === 1 ? 'jour' : 'jours'}`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  return `Aujourd'hui`;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const [isActive, setIsActive] = useState(false);
  const [titleLines, setTitleLines] = useState(1);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      // Calculer le nombre de lignes du titre
      const scrollHeight = titleRef.current.scrollHeight;
      const lineHeight = parseInt(
        window.getComputedStyle(titleRef.current).lineHeight,
      );
      const lines = Math.ceil(scrollHeight / lineHeight);
      setTitleLines(lines);
    }
  }, [event.name]);

  const dateObj = new Date(event.date);
  const dayName = dateObj
    .toLocaleDateString('fr-FR', { weekday: 'short' })
    .slice(0, 3);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const time = dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = `${dayName} ${day}/${month} à ${time}`;
  const remainingTime = getRemainingTime(event.date);

  const priceText =
    event.pricing === 0 ? 'Gratuit' : `À partir de ${event.pricing / 100}€`;

  const imageUrl =
    event.media[0]?.url || `https://picsum.photos/400?random=${event.id}`;

  // Couleur de l'ombre basée sur la première catégorie
  const firstCategory = event.categories[0];
  const shadowColor = getCategoryShadowColor(firstCategory);

  return (
    <div
      className={`card w-full max-w-full sm:max-w-none md:max-w-sm lg:max-w-sm 2xl:max-w-110 max-h-110 px-1 sm:px-0 transition-all duration-300 cursor-pointer bg-white/85 flex flex-col ${
        isActive ? 'shadow-2xl scale-105' : 'hover:shadow-2xl hover:scale-105'
      }`}
      style={{
        boxShadow: isActive
          ? `0 5px 7px ${shadowColor}`
          : '0 5px 7px rgba(0, 0, 0, 0.1)',
      }}
      onMouseOver={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => onClick?.(event)}
    >
      <figure
        className={`relative overflow-hidden transition-all duration-200 ${
          titleLines > 1 ? 'h-48' : 'h-60'
        }`}
      >
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        {/* Actions flottantes */}
        <div
          className="absolute top-2 right-2 flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            disabled
            title="Partager (bientôt disponible)"
            className="flex items-center justify-center w-8 h-8 bg-white/80 rounded-full cursor-not-allowed text-gray-400"
          >
            <Share2 size={14} />
          </button>
          <button
            disabled
            title="Ajouter aux favoris (bientôt disponible)"
            className="flex items-center justify-center w-8 h-8 bg-white/80 rounded-full cursor-not-allowed text-gray-400"
          >
            <Heart size={14} />
          </button>
        </div>
      </figure>

      <div className="card-body p-4 gap-2 flex-1 flex flex-col justify-between">
        {/* Titre + Catégories */}
        <div className="space-y-1">
          <h2 ref={titleRef} className="card-title text-base line-clamp-2">
            {event.name}
          </h2>
          <div className="flex flex-wrap gap-1">
            {event.categories.map((category) => {
              const hexColor = getCategoryHexColor(category);
              return (
                <div
                  key={category}
                  className="px-2 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: `${hexColor}15`, // 15% opacity pour le fond
                    color: hexColor,
                  }}
                >
                  {getCategoryLabel(category)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Infos */}
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-gray-400" />
            <span className="truncate text-gray-500">
              {event.location.postalCode} {event.location.city}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
              <Euro size={14} />
              <span className="font-semibold">{priceText}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={14} className="shrink-0" />
            <span>{remainingTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
