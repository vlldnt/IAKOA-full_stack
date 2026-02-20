// Configuration des catégories groupées pour le menu de filtres
export interface CategoryGroup {
  id: string;
  label: string;
  image: string;
  subcategories: {
    id: string;
    label: string;
    hexColor: string;
  }[];
}

// Import des images pour chaque catégorie
import musique from '@/assets/images/musique.png';
import sport from '@/assets/images/sport.png';
import jeux from '@/assets/images/jeux.png';
import gastronomie from '@/assets/images/gastronomie.png';
import formation from '@/assets/images/formation.png';
import marche from '@/assets/images/marche.png';
import ecologie from '@/assets/images/ecologie.png';

export const FILTER_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'arts_culture',
    label: 'Musique, Arts & Culture',
    image: musique,
    subcategories: [
      { id: 'CONCERT',      label: 'Concert',       hexColor: '#E11D48' },
      { id: 'THEATRE',      label: 'Théâtre',        hexColor: '#BE123C' },
      { id: 'SPECTACLE',    label: 'Spectacle',      hexColor: '#F43F5E' },
      { id: 'DANSE',        label: 'Danse',          hexColor: '#FB7185' },
      { id: 'CINEMA',       label: 'Cinéma',         hexColor: '#9F1239' },
      { id: 'ART',          label: 'Art',            hexColor: '#FF4D72' },
      { id: 'PEINTURE',     label: 'Peinture',       hexColor: '#C8164A' },
      { id: 'PHOTOGRAPHIE', label: 'Photographie',   hexColor: '#D01848' },
      { id: 'EXPOSITION',   label: 'Exposition',     hexColor: '#A81040' },
      { id: 'MUSEE',        label: 'Musée',          hexColor: '#881337' },
      { id: 'LECTURE',      label: 'Lecture',        hexColor: '#F53060' },
    ],
  },
  {
    id: 'sports_wellness',
    label: 'Sports & Bien-être',
    image: sport,
    subcategories: [
      { id: 'TRAIL',                  label: 'Trail',                   hexColor: '#F97316' },
      { id: 'SPORT',                  label: 'Sport',                   hexColor: '#EA580C' },
      { id: 'COMPETITION',            label: 'Compétition',             hexColor: '#C2410C' },
      { id: 'RANDONNEE',              label: 'Randonnée',               hexColor: '#9A3412' },
      { id: 'NAUTISME',               label: 'Nautisme',                hexColor: '#FB923C' },
      { id: 'YOGA',                   label: 'Yoga',                    hexColor: '#FDBA74' },
      { id: 'MEDITATION',             label: 'Méditation',              hexColor: '#FED7AA' },
      { id: 'BIENETRE',               label: 'Bien-être',               hexColor: '#FF9A50' },
      { id: 'DEVELOPPEMENTPERSONNEL', label: 'Développement personnel', hexColor: '#FF7A28' },
    ],
  },
  {
    id: 'leisure_entertainment',
    label: 'Loisirs & Divertissements',
    image: jeux,
    subcategories: [
      { id: 'JEUX',       label: 'Jeux',         hexColor: '#6366F1' },
      { id: 'JEUXVIDEO',  label: 'Jeux vidéo',   hexColor: '#4F46E5' },
      { id: 'ESPORT',     label: 'E-sport',      hexColor: '#4338CA' },
      { id: 'MANGA',      label: 'Manga',        hexColor: '#818CF8' },
      { id: 'COSPLAY',    label: 'Cosplay',      hexColor: '#7C3AED' },
      { id: 'FESTIVAL',   label: 'Festival',     hexColor: '#8B5CF6' },
      { id: 'FETELOCALE', label: 'Fête locale',  hexColor: '#3730A3' },
      { id: 'FERIA',      label: 'Féria',        hexColor: '#312E81' },
      { id: 'SOIREE',     label: 'Soirée',       hexColor: '#A5B4FC' },
      { id: 'JOURNEE',    label: 'Journée',      hexColor: '#6D70F5' },
    ],
  },
  {
    id: 'gastronomy',
    label: 'Gastronomie',
    image: gastronomie,
    subcategories: [
      { id: 'REPAS',          label: 'Repas',            hexColor: '#D97706' },
      { id: 'DEJEUNER',       label: 'Déjeuner',         hexColor: '#FBBF24' },
      { id: 'COURSDECUISINE', label: 'Cours de cuisine', hexColor: '#B45309' },
      { id: 'DEGUSTATION',    label: 'Dégustation',      hexColor: '#F59E0B' },
      { id: 'BAR',            label: 'Bar',              hexColor: '#92400E' },
    ],
  },
  {
    id: 'learning_discovery',
    label: 'Savoir & Découverte',
    image: formation,
    subcategories: [
      { id: 'CONFERENCE', label: 'Conférence',  hexColor: '#0D9488' },
      { id: 'FORMATION',  label: 'Formation',   hexColor: '#0F766E' },
      { id: 'LANGUES',    label: 'Langues',     hexColor: '#14B8A6' },
      { id: 'SCIENCE',    label: 'Science',     hexColor: '#0891B2' },
      { id: 'DECOUVERTE', label: 'Découverte',  hexColor: '#2DD4BF' },
      { id: 'PATRIMOINE', label: 'Patrimoine',  hexColor: '#115E59' },
      { id: 'VISITE',     label: 'Visite',      hexColor: '#134E4A' },
      { id: 'ATELIER',    label: 'Atelier',     hexColor: '#0D7A74' },
    ],
  },
  {
    id: 'market_commerce',
    label: 'Marché & Commerce',
    image: marche,
    subcategories: [
      { id: 'MARCHE',      label: 'Marché',       hexColor: '#B45309' },
      { id: 'BROCANTE',    label: 'Brocante',     hexColor: '#92400E' },
      { id: 'VIDEGRENIER', label: 'Vide-grenier', hexColor: '#D97706' },
      { id: 'ENCHERES',    label: 'Enchères',     hexColor: '#78350F' },
    ],
  },
  {
    id: 'social_causes',
    label: 'Causes Sociales & Écologie',
    image: ecologie,
    subcategories: [
      { id: 'ANIMAUX',    label: 'Animaux',    hexColor: '#4ADE80' },
      { id: 'BENEVOLAT',  label: 'Bénévolat',  hexColor: '#22C55E' },
      { id: 'ECOLOGIE',   label: 'Écologie',   hexColor: '#16A34A' },
      { id: 'SOLIDARITE', label: 'Solidarité', hexColor: '#15803D' },
    ],
  },
];

// Catégories synonymes — présentes dans les événements mais pas dans le menu filtre
const SYNONYMS: Record<string, { label: string; hexColor: string }> = {
  // Arts & Culture
  OPERA:            { label: 'Opéra & Comédie musicale',           hexColor: '#960F35' },
  FANFARE:          { label: 'Fanfare & Orchestre',                 hexColor: '#FF6080' },
  HUMOUR:           { label: 'Humour & Stand-up',                   hexColor: '#F5607A' },
  COURSDEDANSE:     { label: 'Cours de danse',                      hexColor: '#CC1244' },
  VERNISSAGE:       { label: 'Vernissage',                          hexColor: '#B80F40' },
  MODE:             { label: 'Mode & Design',                       hexColor: '#FF8FA3' },
  LANCEMENTDELIVRE: { label: 'Lancement de livre',                  hexColor: '#FF6381' },
  // Sports & Bien-être
  AVENTURE:              { label: 'Aventure & Outdoor',             hexColor: '#CC5200' },
  OUTDOOR:               { label: 'Plein air & Nature',             hexColor: '#B84800' },
  RENCONTRESPORTIVE:     { label: 'Rencontre sportive',             hexColor: '#BF5500' },
  CYCLISME:              { label: 'Cyclisme & VTT',                 hexColor: '#E56010' },
  NATATION:              { label: 'Natation & Sports nautiques',    hexColor: '#FF8C3A' },
  NEIGE:                 { label: "Sports d'hiver & Neige",         hexColor: '#FFB08C' },
  FITNESS:               { label: 'Fitness & Musculation',          hexColor: '#D45500' },
  PILATES:               { label: 'Pilates & Stretching',           hexColor: '#FFB070' },
  JARDINAGE:             { label: 'Jardinage & Permaculture',       hexColor: '#FFAA5E' },
  FERME:                 { label: 'Ferme & Agriculture',            hexColor: '#E87020' },
  // Loisirs & Divertissements
  TOURNOIJEUXVIDEO: { label: 'Tournoi jeux vidéo',                  hexColor: '#3B3CB5' },
  SOIREEJEUX:       { label: 'Soirée jeux & Afterwork',             hexColor: '#5A5EE8' },
  JEUXDEROLE:       { label: 'Jeux de rôle & Wargame',              hexColor: '#5248DB' },
  ESCAPEGAME:       { label: 'Escape game & Enquête',               hexColor: '#9395F8' },
  KARAOKE:          { label: 'Karaoké & Scène ouverte',             hexColor: '#B0B3FF' },
  // Gastronomie
  BRUNCH:     { label: 'Brunch & Petit-déjeuner',                   hexColor: '#E8A208' },
  PIQUENIQUE: { label: 'Pique-nique & Apéro',                       hexColor: '#FCD34D' },
  FOODTRUCK:  { label: 'Food truck & Street food',                  hexColor: '#C67C0A' },
  // Savoir & Découverte
  TECHNOLOGIE:        { label: 'Innovation & Numérique',            hexColor: '#06B6D4' },
  NUMERIQUE:          { label: 'Atelier numérique & Coding',        hexColor: '#0CB4A6' },
  PHILOSOPHIE:        { label: 'Philosophie & Conférence citoyenne',hexColor: '#0E8078' },
  CREATIVITE:         { label: 'Créativité & Expression artistique',hexColor: '#1CC4B0' },
  BRICOLAGE:          { label: 'Bricolage & DIY',                   hexColor: '#0A6E68' },
  SALONPROFESSIONNEL: { label: 'Salon & Forum professionnel',       hexColor: '#128878' },
  // Marché & Commerce
  ARTISANAT:      { label: 'Artisanat & Fait main',                 hexColor: '#A8520A' },
  SALONARTISANAT: { label: 'Salon artisanat & Créateurs',           hexColor: '#C06010' },
  // Causes Sociales & Écologie
  NATURE:             { label: 'Nature & Biodiversité',             hexColor: '#166534' },
  HUMANITAIRE:        { label: 'Action humanitaire',                hexColor: '#34D399' },
  EVENEMENTCARITATIF: { label: 'Événement caritatif & Don',         hexColor: '#14924A' },
  FAMILLE:            { label: 'Famille & Petite enfance',          hexColor: '#2DB855' },
  RENCONTRE:          { label: 'Rencontre & Lien social',           hexColor: '#1FAD4C' },
};

// Lookup plat : groupes + synonymes
const CATEGORY_LOOKUP: Record<string, { label: string; hexColor: string }> = {};

for (const group of FILTER_CATEGORY_GROUPS) {
  for (const sub of group.subcategories) {
    CATEGORY_LOOKUP[sub.id] = { label: sub.label, hexColor: sub.hexColor };
  }
}
for (const [id, entry] of Object.entries(SYNONYMS)) {
  CATEGORY_LOOKUP[id] = entry;
}

/** Récupère le label français d'une catégorie */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LOOKUP[category]?.label ?? category;
}

/** Récupère la couleur hex d'une catégorie */
export function getCategoryHexColor(category: string): string {
  return CATEGORY_LOOKUP[category]?.hexColor ?? '#3B82F6';
}

/** Dérive une couleur d'ombre (20 % d'opacité) */
export function getCategoryShadowColor(category: string): string {
  return `${getCategoryHexColor(category)}33`;
}
