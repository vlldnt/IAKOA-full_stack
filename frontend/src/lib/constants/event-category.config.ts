// Configuration des catégories d'événements avec labels français et couleurs
export interface CategoryConfig {
  label: string;
  color: string; // classe Tailwind pour le badge (legacy)
  variant?: string; // variante optionnelle (ex: "badge-outline")
  hexColor: string; // couleur hex pour les styles personnalisés
  shadowColor: string; // couleur pour l'ombre (teinte 200)
}

export const EVENT_CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // Musique et Spectacle
  CONCERT: { label: 'Concert', color: 'badge-error', hexColor: '#EF4444', shadowColor: '#FECACA' },
  THEATRE: { label: 'Théâtre', color: 'badge-error', hexColor: '#DC2626', shadowColor: '#FECACA' },
  SPECTACLE: { label: 'Spectacle', color: 'badge-error', hexColor: '#E11D48', shadowColor: '#FBCFE8' },
  FANFARE: { label: 'Fanfare', color: 'badge-error', hexColor: '#BE185D', shadowColor: '#FBCFE8' },
  DANSE: { label: 'Danse', color: 'badge-error', hexColor: '#D1364F', shadowColor: '#FBCFE8' },
  COURSDEDANSE: { label: 'Cours de danse', color: 'badge-error', hexColor: '#C2185B', shadowColor: '#FBCFE8' },
  CINEMA: { label: 'Cinéma', color: 'badge-error', hexColor: '#A6194B', shadowColor: '#FBCFE8' },

  // Sport et Aventure
  TRAIL: { label: 'Trail', color: 'badge-warning', hexColor: '#F97316', shadowColor: '#FED7AA' },
  SPORT: { label: 'Sport', color: 'badge-warning', variant: 'badge-outline', hexColor: '#EA580C', shadowColor: '#FED7AA' },
  COMPETITION: { label: 'Compétition', color: 'badge-error', hexColor: '#DC2626', shadowColor: '#FECACA' },
  RENCONTRESPORTIVE: { label: 'Rencontre sportive', color: 'badge-error', variant: 'badge-outline', hexColor: '#991B1B', shadowColor: '#FEE2E2' },
  AVENTURE: { label: 'Aventure', color: 'badge-warning', hexColor: '#D97706', shadowColor: '#FED7AA' },
  RANDONNEE: { label: 'Randonnée', color: 'badge-warning', variant: 'badge-outline', hexColor: '#92400E', shadowColor: '#FEF3C7' },
  OUTDOOR: { label: 'Outdoor', color: 'badge-error', hexColor: '#B91C1C', shadowColor: '#FEE2E2' },
  NEIGE: { label: 'Neige', color: 'badge-info', hexColor: '#0369A1', shadowColor: '#CFFAFE' },
  NAUTISME: { label: 'Nautisme', color: 'badge-info', variant: 'badge-outline', hexColor: '#0C4A6E', shadowColor: '#E0F2FE' },
  JARDINAGE: { label: 'Jardinage', color: 'badge-success', hexColor: '#16A34A', shadowColor: '#BBFBD0' },
  FERME: { label: 'Ferme', color: 'badge-success', variant: 'badge-outline', hexColor: '#166534', shadowColor: '#DCFCE7' },

  // Bien-être et Santé
  YOGA: { label: 'Yoga', color: 'badge-success', hexColor: '#22C55E', shadowColor: '#BBFBD0' },
  MEDITATION: { label: 'Méditation', color: 'badge-success', variant: 'badge-outline', hexColor: '#166534', shadowColor: '#DCFCE7' },
  BIENETRE: { label: 'Bien-être', color: 'badge-success', hexColor: '#4ADE80', shadowColor: '#DCFCE7' },
  DEVELOPPEMENTPERSONNEL: { label: 'Développement personnel', color: 'badge-success', variant: 'badge-outline', hexColor: '#15803D', shadowColor: '#DCFCE7' },

  // Art et Culture
  ART: { label: 'Art', color: 'badge-secondary', hexColor: '#A855F7', shadowColor: '#E9D5FF' },
  PEINTURE: { label: 'Peinture', color: 'badge-secondary', hexColor: '#9333EA', shadowColor: '#F3E8FF' },
  PHOTOGRAPHIE: { label: 'Photographie', color: 'badge-secondary', hexColor: '#7E22CE', shadowColor: '#F3E8FF' },
  EXPOSITION: { label: 'Exposition', color: 'badge-secondary', hexColor: '#6B21A8', shadowColor: '#F3E8FF' },
  MUSEE: { label: 'Musée', color: 'badge-secondary', hexColor: '#581C87', shadowColor: '#F3E8FF' },
  LANCEMENTDELIVRE: { label: 'Lancement de livre', color: 'badge-secondary', hexColor: '#8B5CF6', shadowColor: '#E9D5FF' },
  LECTURE: { label: 'Lecture', color: 'badge-secondary', hexColor: '#A78BFA', shadowColor: '#EDE9FE' },
  MODE: { label: 'Mode', color: 'badge-secondary', hexColor: '#C4B5FD', shadowColor: '#F5F3FF' },

  // Jeux et Loisirs
  JEUX: { label: 'Jeux', color: 'badge-info', hexColor: '#0EA5E9', shadowColor: '#CFFAFE' },
  JEUXVIDEO: { label: 'Jeux vidéo', color: 'badge-info', variant: 'badge-outline', hexColor: '#075985', shadowColor: '#E0F2FE' },
  SOIREEJEUX: { label: 'Soirée jeux', color: 'badge-info', hexColor: '#06B6D4', shadowColor: '#CFFAFE' },
  ESPORT: { label: 'E-sport', color: 'badge-accent', hexColor: '#EC4899', shadowColor: '#FBCFE8' },
  TOURNOIJEUXVIDEO: { label: 'Tournoi jeux vidéo', color: 'badge-accent', variant: 'badge-outline', hexColor: '#BE185D', shadowColor: '#FBCFE8' },
  MANGA: { label: 'Manga', color: 'badge-secondary', hexColor: '#D946EF', shadowColor: '#F3E8FF' },
  COSPLAY: { label: 'Cosplay', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#A21CAF', shadowColor: '#F3E8FF' },

  // Gastronomie
  REPAS: { label: 'Repas', color: 'badge-accent', hexColor: '#F59E0B', shadowColor: '#FEF3C7' },
  DEJEUNER: { label: 'Déjeuner', color: 'badge-accent', hexColor: '#FBBF24', shadowColor: '#FEF3C7' },
  COURSDECUISINE: { label: 'Cours de cuisine', color: 'badge-accent', hexColor: '#F97316', shadowColor: '#FED7AA' },
  DEGUSTATION: { label: 'Dégustation', color: 'badge-accent', hexColor: '#FB923C', shadowColor: '#FEDBA9' },
  BAR: { label: 'Bar', color: 'badge-accent', hexColor: '#FDBA74', shadowColor: '#FEF3C7' },

  // Événements et Festivals
  FESTIVAL: { label: 'Festival', color: 'badge-primary', hexColor: '#3B82F6', shadowColor: '#DBEAFE' },
  FETELOCALE: { label: 'Fête locale', color: 'badge-primary', hexColor: '#1E40AF', shadowColor: '#EFF6FF' },
  FERIA: { label: 'Féria', color: 'badge-primary', hexColor: '#1E3A8A', shadowColor: '#EFF6FF' },
  SOIREE: { label: 'Soirée', color: 'badge-primary', hexColor: '#2563EB', shadowColor: '#DBEAFE' },
  JOURNEE: { label: 'Journée', color: 'badge-primary', hexColor: '#60A5FA', shadowColor: '#E0E7FF' },

  // Formation et Conférences
  CONFERENCE: { label: 'Conférence', color: 'badge-ghost', hexColor: '#6B7280', shadowColor: '#F3F4F6' },
  FORMATION: { label: 'Formation', color: 'badge-ghost', variant: 'badge-outline', hexColor: '#374151', shadowColor: '#F9FAFB' },
  LANGUES: { label: 'Langues', color: 'badge-secondary', hexColor: '#A78BFA', shadowColor: '#EDE9FE' },
  SALONPROFESSIONNEL: { label: 'Salon professionnel', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#5B21B6', shadowColor: '#F3E8FF' },
  SCIENCE: { label: 'Science', color: 'badge-info', hexColor: '#06B6D4', shadowColor: '#CFFAFE' },

  // Découverte et Patrimoine
  DECOUVERTE: { label: 'Découverte', color: 'badge-primary', hexColor: '#6366F1', shadowColor: '#E0E7FF' },
  PATRIMOINE: { label: 'Patrimoine', color: 'badge-primary', hexColor: '#4F46E5', shadowColor: '#E0E7FF' },
  VISITE: { label: 'Visite', color: 'badge-primary', hexColor: '#4338CA', shadowColor: '#E0E7FF' },
  ATELIER: { label: 'Atelier', color: 'badge-primary', hexColor: '#3730A3', shadowColor: '#E0E7FF' },
  BRICOLAGE: { label: 'Bricolage', color: 'badge-primary', hexColor: '#312E81', shadowColor: '#EFF6FF' },

  // Marché et Commerce
  MARCHE: { label: 'Marche', color: 'badge-warning', hexColor: '#B45309', shadowColor: '#FEF3C7' },
  BROCANTE: { label: 'Brocante', color: 'badge-warning', variant: 'badge-outline', hexColor: '#78350F', shadowColor: '#FEFCE8' },
  VIDEGRENIER: { label: 'Vide-grenier', color: 'badge-warning', hexColor: '#D97706', shadowColor: '#FED7AA' },
  ENCHERES: { label: 'Enchères', color: 'badge-secondary', variant: 'badge-outline', hexColor: '#7C3AED', shadowColor: '#EDE9FE' },

  // Causes sociales
  ANIMAUX: { label: 'Animaux', color: 'badge-success', variant: 'badge-outline', hexColor: '#065F46', shadowColor: '#DCFCE7' },
  BENEVOLAT: { label: 'Bénévolat', color: 'badge-success', hexColor: '#10B981', shadowColor: '#D1FAE5' },
  ECOLOGIE: { label: 'Écologie', color: 'badge-success', variant: 'badge-outline', hexColor: '#047857', shadowColor: '#DCFCE7' },
  SOLIDARITE: { label: 'Solidarité', color: 'badge-warning', hexColor: '#FBBF24', shadowColor: '#FEF3C7' },
  RENCONTRE: { label: 'Rencontre', color: 'badge-accent', hexColor: '#F472B6', shadowColor: '#FBCFE8' },
  EVENEMENTCARITATIF: { label: 'Événement caritatif', color: 'badge-error', variant: 'badge-outline', hexColor: '#7F1D1D', shadowColor: '#FEE2E2' },

  // Technologie
  TECHNOLOGIE: { label: 'Technologie', color: 'badge-info', hexColor: '#0284C7', shadowColor: '#CFFAFE' },
  NATURE: { label: 'Nature', color: 'badge-success', hexColor: '#059669', shadowColor: '#D1FAE5' },
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

/**
 * Récupère la couleur d'ombre (teinte 200) d'une catégorie
 */
export function getCategoryShadowColor(category: string): string {
  return EVENT_CATEGORY_CONFIG[category]?.shadowColor || '#DBEAFE';
}
