// Configuration des catégories d'événements avec labels français et couleurs
export interface CategoryConfig {
  label: string;
  color: string; // classe Tailwind pour le badge (legacy)
  variant?: string; // variante optionnelle (ex: "badge-outline")
  hexColor: string; // couleur hex pour les styles personnalisés
}

export const EVENT_CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Musique et Spectacle
  CONCERT: { label: 'Concert', color: 'badge-error', hexColor: '#EF4444' },
  THEATRE: { label: 'Théâtre', color: 'badge-error', hexColor: '#DC2626' },
  SPECTACLE: { label: 'Spectacle', color: 'badge-error', hexColor: '#E11D48' },
  FANFARE: { label: 'Fanfare', color: 'badge-error', hexColor: '#BE185D' },
  DANSE: { label: 'Danse', color: 'badge-error', hexColor: '#D1364F' },
  COURSDEDANSE: { label: 'Cours de danse', color: 'badge-error', hexColor: '#C2185B' },
  CINEMA: { label: 'Cinéma', color: 'badge-error', hexColor: '#A6194B' },

  // Sport et Aventure
  TRAIL: { label: 'Trail', color: 'badge-warning', hexColor: '#F97316' },
  SPORT: { label: 'Sport', color: 'badge-warning', variant: 'badge-outline', hexColor: '#EA580C' },
  COMPETITION: { label: 'Compétition', color: 'badge-error', hexColor: '#DC2626' },
  RENCONTRESPORTIVE: { label: 'Rencontre sportive', color: 'badge-error', variant: 'badge-outline', hexColor: '#991B1B' },
  AVENTURE: { label: 'Aventure', color: 'badge-warning', hexColor: '#D97706' },
  RANDONNEE: { label: 'Randonnée', color: 'badge-warning', variant: 'badge-outline', hexColor: '#92400E' },
  OUTDOOR: { label: 'Outdoor', color: 'badge-error', hexColor: '#B91C1C' },
  NEIGE: { label: 'Neige', color: 'badge-info', hexColor: '#0369A1' },
  NAUTISME: { label: 'Nautisme', color: 'badge-info', variant: 'badge-outline', hexColor: '#0C4A6E' },
  JARDINAGE: { label: 'Jardinage', color: 'badge-success', hexColor: '#16A34A' },
  FERME: { label: 'Ferme', color: 'badge-success', variant: 'badge-outline', hexColor: '#166534' },

  // Bien-être et Santé
  YOGA: { label: 'Yoga', color: 'badge-success', hexColor: '#22C55E' },
  MEDITATION: { label: 'Méditation', color: 'badge-success', variant: 'badge-outline', hexColor: '#166534' },
  BIENETRE: { label: 'Bien-être', color: 'badge-success', hexColor: '#4ADE80' },
  DEVELOPPEMENTPERSONNEL: { label: 'Développement personnel', color: 'badge-success', variant: 'badge-outline', hexColor: '#15803D' },

  // Art et Culture
  ART: { label: 'Art', color: 'badge-secondary', hexColor: '#A855F7' },
  PEINTURE: { label: 'Peinture', color: 'badge-secondary', hexColor: '#9333EA' },
  PHOTOGRAPHIE: { label: 'Photographie', color: 'badge-secondary', hexColor: '#7E22CE' },
  EXPOSITION: { label: 'Exposition', color: 'badge-secondary', hexColor: '#6B21A8' },
  MUSEE: { label: 'Musée', color: 'badge-secondary', hexColor: '#581C87' },
  LANCEMENTDELIVRE: { label: 'Lancement de livre', color: 'badge-secondary', hexColor: '#8B5CF6' },
  LECTURE: { label: 'Lecture', color: 'badge-secondary', hexColor: '#A78BFA' },
  MODE: { label: 'Mode', color: 'badge-secondary', hexColor: '#C4B5FD' },

  // Jeux et Loisirs
  JEUX: { label: 'Jeux', color: 'badge-info', hexColor: '#0EA5E9' },
  JEUXVIDEO: { label: 'Jeux vidéo', color: 'badge-info', variant: 'badge-outline', hexColor: '#075985' },
  SOIREEJEUX: { label: 'Soirée jeux', color: 'badge-info', hexColor: '#06B6D4' },
  ESPORT: { label: 'E-sport', color: 'badge-accent', hexColor: '#EC4899' },
  TOURNOIJEUXVIDEO: { label: 'Tournoi jeux vidéo', color: 'badge-accent', variant: 'badge-outline', hexColor: '#BE185D' },
  MANGA: { label: 'Manga', color: 'badge-secondary', hexColor: '#D946EF' },
  COSPLAY: { label: 'Cosplay', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#A21CAF' },

  // Gastronomie
  REPAS: { label: 'Repas', color: 'badge-accent', hexColor: '#F59E0B' },
  DEJEUNER: { label: 'Déjeuner', color: 'badge-accent', hexColor: '#FBBF24' },
  COURSDECUISINE: { label: 'Cours de cuisine', color: 'badge-accent', hexColor: '#F97316' },
  DEGUSTATION: { label: 'Dégustation', color: 'badge-accent', hexColor: '#FB923C' },
  BAR: { label: 'Bar', color: 'badge-accent', hexColor: '#FDBA74' },

  // Événements et Festivals
  FESTIVAL: { label: 'Festival', color: 'badge-primary', hexColor: '#3B82F6' },
  FETELOCALE: { label: 'Fête locale', color: 'badge-primary', hexColor: '#1E40AF' },
  FERIA: { label: 'Féria', color: 'badge-primary', hexColor: '#1E3A8A' },
  SOIREE: { label: 'Soirée', color: 'badge-primary', hexColor: '#2563EB' },
  JOURNEE: { label: 'Journée', color: 'badge-primary', hexColor: '#60A5FA' },

  // Formation et Conférences
  CONFERENCE: { label: 'Conférence', color: 'badge-ghost', hexColor: '#6B7280' },
  FORMATION: { label: 'Formation', color: 'badge-ghost', variant: 'badge-outline', hexColor: '#374151' },
  LANGUES: { label: 'Langues', color: 'badge-secondary', hexColor: '#A78BFA' },
  SALONPROFESSIONNEL: { label: 'Salon professionnel', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#5B21B6' },
  SCIENCE: { label: 'Science', color: 'badge-info', hexColor: '#06B6D4' },

  // Découverte et Patrimoine
  DECOUVERTE: { label: 'Découverte', color: 'badge-primary', hexColor: '#6366F1' },
  PATRIMOINE: { label: 'Patrimoine', color: 'badge-primary', hexColor: '#4F46E5' },
  VISITE: { label: 'Visite', color: 'badge-primary', hexColor: '#4338CA' },
  ATELIER: { label: 'Atelier', color: 'badge-primary', hexColor: '#3730A3' },
  BRICOLAGE: { label: 'Bricolage', color: 'badge-primary', hexColor: '#312E81' },

  // Marché et Commerce
  MARCHE: { label: 'Marche', color: 'badge-warning', hexColor: '#B45309' },
  BROCANTE: { label: 'Brocante', color: 'badge-warning', variant: 'badge-outline', hexColor: '#78350F' },
  VIDEGRENIER: { label: 'Vide-grenier', color: 'badge-warning', hexColor: '#D97706' },
  ENCHERES: { label: 'Enchères', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#7C3AED' },

  // Causes sociales
  ANIMAUX: { label: 'Animaux', color: 'badge-success', variant: 'badge-outline', hexColor: '#065F46' },
  BENEVOLAT: { label: 'Bénévolat', color: 'badge-success', hexColor: '#10B981' },
  ECOLOGIE: { label: 'Écologie', color: 'badge-success', variant: 'badge-outline', hexColor: '#047857' },
  SOLIDARITE: { label: 'Solidarité', color: 'badge-warning', hexColor: '#FBBF24' },
  RENCONTRE: { label: 'Rencontre', color: 'badge-accent', hexColor: '#F472B6' },
  EVENEMENTCARITATIF: { label: 'Événement caritatif', color: 'badge-error', variant: 'badge-outline', hexColor: '#7F1D1D' },

  // Technologie
  TECHNOLOGIE: { label: 'Technologie', color: 'badge-info', hexColor: '#0284C7' },
  NATURE: { label: 'Nature', color: 'badge-success', hexColor: '#059669' },
};

/**
 * Récupère le label français d'une catégorie
 */
export function getCategoryLabel(category: string): string {
  return EVENT_CATEGORY_CONFIG[category]?.label || category;
}

/**
 * Récupère la couleur d'une catégorie (avec variante optionnelle)
 */
export function getCategoryColor(category: string): string {
  const config = EVENT_CATEGORY_CONFIG[category];
  if (!config) return 'badge-primary';

  const classes = [config.color];
  if (config.variant) {
    classes.push(config.variant);
  }
  return classes.join(' ');
}

/**
 * Récupère la couleur hex d'une catégorie
 */
export function getCategoryHexColor(category: string): string {
  return EVENT_CATEGORY_CONFIG[category]?.hexColor || '#3B82F6';
}
