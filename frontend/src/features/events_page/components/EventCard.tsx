import { Calendar, DollarSign, Users } from 'lucide-react';
import { useState } from 'react';

export function EventCard() {
  const [isActive, setIsActive] = useState(false);
  const event = {
    name: 'Concert Jazz au Théâtre de Rodez MIllau et Toulouse en soirée et matin',
    date: '2026-05-15T20:30:00Z',
    description: `Plongez dans une soirée jazz intimiste où l'atmosphère chaleureuse et conviviale vous transporte au cœur de la musique. Des musiciens locaux talentueux se produiront sur scène, accompagnés d'invités spéciaux, pour offrir des performances uniques mêlant standards du jazz, improvisations et créations originales. Que vous soyez amateur de jazz ou simplement curieux, cette soirée promet une expérience musicale inoubliable, dans un cadre cosy et élégant, idéal pour se détendre entre amis ou en couple.

Exemple de programmation par jour :

18h30 – 19h30 : Happy Hour & Apéritif Musical
Ambiance jazz douce en fond sonore avec un pianiste local. Cocktails et petites assiettes à disposition.

19h30 – 20h30 : Premier Set du Groupe Local
Trio ou quartet interprétant des classiques du jazz et des compositions originales.

20h30 – 21h00 : Pause & Rencontres
Possibilité de rencontrer les musiciens, photos, dédicaces, et commandes de boissons/snacks.

21h00 – 22h00 : Set avec Invité Spécial
Saxophoniste ou chanteur invité pour un moment exceptionnel, avec improvisations et échanges avec le public.

22h00 – 22h30 : Clôture & Ambiance Lounge
Musique légère pour terminer la soirée, propice aux discussions et à la détente.

Exemple de tarifs :

Entrée générale : 20 €

Forfait soirée + apéritif : 30 €

Table VIP avec service de boissons : 50 € par personne`,
    pricing: 2500,
    location: {
      address: "2 Place d'Armes",
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3506, lng: 2.5736 },
    },
    companyId: 'IAKOA Corp.',
    website: 'https://example.com/concert-rodez',
    categories: ['CONCERT'],
    media: [{ url: 'https://picsum.photos/400', type: 'image/jpeg' }],
  };

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

  const randomImage = `https://picsum.photos/400?random=${Math.random()}`;

  return (
    <div
      className={`card max-w-110 sm:max-w-90 lg:max-w-110 h-fit transition-all duration-300 cursor-pointer bg-white/85 ${
        isActive ? 'shadow-2xl scale-105' : 'hover:shadow-2xl hover:scale-105'
      }`}
      onClick={() => setIsActive(!isActive)}
      onMouseLeave={() => setIsActive(false)}
    >
      <figure className="h-60 overflow-hidden">
        <img
          src={randomImage}
          alt={event.name}
          className="w-full h-full object-cover"
        />
      </figure>

      <div className="card-body p-4 gap-2">
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
            <span>{event.companyId}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
