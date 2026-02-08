import { Calendar, DollarSign, Users } from 'lucide-react';
import { useState } from 'react';
import type { EventType } from '@/lib/types/EventType';

interface EventCardProps {
  event: EventType;
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
                {category}
              </div>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0" />
            <span>Début: {formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign size={14} className="shrink-0" />
            <span>{priceText}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="shrink-0" />
            <span>Créé par {event.company?.name || 'Organisation'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
