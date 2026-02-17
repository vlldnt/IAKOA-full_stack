// Configuration des catégories groupées pour le menu de filtres
export interface CategoryGroup {
  id: string;
  label: string;
  image: string;
  subcategories: {
    id: string;
    label: string;
  }[];
}

// Import des images pour chaque catégorie
import musique from '@/assets/images/musique.png';
import sport from '@/assets/images/sport.png';
import bienetre from '@/assets/images/bienetre.png';
import art from '@/assets/images/art.png';
import jeux from '@/assets/images/jeux.png';
import gastronomie from '@/assets/images/gastronomie.png';
import festival from '@/assets/images/festival.png';
import formation from '@/assets/images/formation.png';
import decouverte from '@/assets/images/decouverte.png';
import marche from '@/assets/images/marche.png';
import ecologie from '@/assets/images/ecologie.png';

export const FILTER_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'music_spectacle',
    label: 'Musique & Spectacle',
    image: musique,
    subcategories: [
      { id: 'CONCERT', label: 'Concert' },
      { id: 'THEATRE', label: 'Théâtre' },
      { id: 'SPECTACLE', label: 'Spectacle' },
      { id: 'DANSE', label: 'Danse' },
      { id: 'CINEMA', label: 'Cinéma' },
    ],
  },
  {
    id: 'sport_aventure',
    label: 'Sport & Aventure',
    image: sport,
    subcategories: [
      { id: 'TRAIL', label: 'Trail' },
      { id: 'SPORT', label: 'Sport' },
      { id: 'COMPETITION', label: 'Compétition' },
      { id: 'RANDONNEE', label: 'Randonnée' },
      { id: 'NAUTISME', label: 'Nautisme' },
    ],
  },
  {
    id: 'wellness',
    label: 'Bien-être & Santé',
    image: bienetre,
    subcategories: [
      { id: 'YOGA', label: 'Yoga' },
      { id: 'MEDITATION', label: 'Méditation' },
      { id: 'BIENETRE', label: 'Bien-être' },
      { id: 'DEVELOPPEMENTPERSONNEL', label: 'Développement personnel' },
    ],
  },
  {
    id: 'art_culture',
    label: 'Art & Culture',
    image: art,
    subcategories: [
      { id: 'ART', label: 'Art' },
      { id: 'PEINTURE', label: 'Peinture' },
      { id: 'PHOTOGRAPHIE', label: 'Photographie' },
      { id: 'EXPOSITION', label: 'Exposition' },
      { id: 'MUSEE', label: 'Musée' },
      { id: 'LECTURE', label: 'Lecture' },
    ],
  },
  {
    id: 'games_leisure',
    label: 'Jeux & Loisirs',
    image: jeux,
    subcategories: [
      { id: 'JEUX', label: 'Jeux' },
      { id: 'JEUXVIDEO', label: 'Jeux vidéo' },
      { id: 'ESPORT', label: 'E-sport' },
      { id: 'MANGA', label: 'Manga' },
      { id: 'COSPLAY', label: 'Cosplay' },
    ],
  },
  {
    id: 'gastronomy',
    label: 'Gastronomie',
    image: gastronomie,
    subcategories: [
      { id: 'REPAS', label: 'Repas' },
      { id: 'DEJEUNER', label: 'Déjeuner' },
      { id: 'COURSDECUISINE', label: 'Cours de cuisine' },
      { id: 'DEGUSTATION', label: 'Dégustation' },
      { id: 'BAR', label: 'Bar' },
    ],
  },
  {
    id: 'events_festivals',
    label: 'Événements & Festivals',
    image: festival,
    subcategories: [
      { id: 'FESTIVAL', label: 'Festival' },
      { id: 'FETELOCALE', label: 'Fête locale' },
      { id: 'FERIA', label: 'Féria' },
      { id: 'SOIREE', label: 'Soirée' },
      { id: 'JOURNEE', label: 'Journée' },
    ],
  },
  {
    id: 'learning_conference',
    label: 'Formation & Conférences',
    image: formation,
    subcategories: [
      { id: 'CONFERENCE', label: 'Conférence' },
      { id: 'FORMATION', label: 'Formation' },
      { id: 'LANGUES', label: 'Langues' },
      { id: 'SCIENCE', label: 'Science' },
    ],
  },
  {
    id: 'discovery_heritage',
    label: 'Découverte & Patrimoine',
    image: decouverte,
    subcategories: [
      { id: 'DECOUVERTE', label: 'Découverte' },
      { id: 'PATRIMOINE', label: 'Patrimoine' },
      { id: 'VISITE', label: 'Visite' },
      { id: 'ATELIER', label: 'Atelier' },
    ],
  },
  {
    id: 'market_commerce',
    label: 'Marché & Commerce',
    image: marche,
    subcategories: [
      { id: 'MARCHE', label: 'Marche' },
      { id: 'BROCANTE', label: 'Brocante' },
      { id: 'VIDEGRENIER', label: 'Vide-grenier' },
      { id: 'ENCHERES', label: 'Enchères' },
    ],
  },
  {
    id: 'social_causes',
    label: 'Causes Sociales & Écologie',
    image: ecologie,
    subcategories: [
      { id: 'ANIMAUX', label: 'Animaux' },
      { id: 'BENEVOLAT', label: 'Bénévolat' },
      { id: 'ECOLOGIE', label: 'Écologie' },
      { id: 'SOLIDARITE', label: 'Solidarité' },
    ],
  },
];
