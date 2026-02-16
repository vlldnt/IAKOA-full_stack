import { Calendar, DollarSign, Clock } from 'lucide-react';
import { useState } from 'react';
import type { EventType } from '@/lib/types/EventType';

interface EventCardProps {
  event: EventType;
}

function getRemainingTime(dateString: string) {
  const now = new Date().getTime();
  const eventTime = new Date(dateString).getTime();
  const diff = eventTime - now;

  if (diff <= 0) return 'Événement terminé';

  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60)) / (1000 * 60)
  );

  if (months > 0) return `${months} mois`
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `Aujourd'hui`;
}

export function EventCard({ event }: EventCardProps) {
  const [isActive, setIsActive] = useState(false);

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

  const imageUrl = event.media[0]?.url || `https://picsum.photos/400?random=${event.id}`;

  return (
    <div
      className={`card w-full max-w-85 h-80 transition-all duration-300 cursor-pointer bg-white/85 flex flex-col ${
        isActive ? 'shadow-2xl scale-105' : 'hover:shadow-2xl hover:scale-105'
      }`}
      onClick={() => setIsActive(!isActive)}
      onMouseLeave={() => setIsActive(false)}
    >
      <figure className="h-60 overflow-hidden">
        <img
          src={imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
      </figure>

      <div className="card-body p-4 gap-2 flex-1 flex flex-col justify-between">
        {/* Titre + Catégories */}
        <div className="space-y-1">
          <h2 className="card-title text-base line-clamp-2">{event.name}</h2>
          <div className="flex flex-wrap gap-1">
            {event.categories.map((category) => (
              <div key={category} className="badge badge-sm badge-primary">
                {category.charAt(0) + category.slice(1).toLocaleLowerCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Clock size={14} className="shrink-0" />
            <span>{remainingTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign size={14} className="shrink-0" />
            <span>{priceText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
