// Configuration des catégories d'événements avec labels français et couleurs
export interface CategoryConfig {
  label: string;
  hexColor: string; // couleur hex — principale pour le groupe, variante pour les sous-catégories
}

export const EVENT_CATEGORY_CONFIG: Record<string, CategoryConfig> = {

  // ══════════════════════════════════════════════════════════
  // 🎭  Musique, Arts & Culture — Famille Cramoisi / Rose
  //     Principal : #E11D48
  // ══════════════════════════════════════════════════════════
  CONCERT:          { label: 'Concert',                   hexColor: '#E11D48' }, // principal
  SPECTACLE:        { label: 'Spectacle vivant',           hexColor: '#F43F5E' },
  DANSE:            { label: 'Danse',                      hexColor: '#FB7185' },
  THEATRE:          { label: 'Théâtre & Comédie',          hexColor: '#BE123C' },
  CINEMA:           { label: 'Cinéma & Projection',        hexColor: '#9F1239' },
  OPERA:            { label: 'Opéra & Comédie musicale',   hexColor: '#960F35' },
  FANFARE:          { label: 'Fanfare & Orchestre',        hexColor: '#FF6080' },
  HUMOUR:           { label: 'Humour & Stand-up',          hexColor: '#F5607A' },
  COURSDEDANSE:     { label: 'Cours de danse',             hexColor: '#CC1244' },
  ART:              { label: 'Art & Création',             hexColor: '#FF4D72' },
  PEINTURE:         { label: 'Peinture & Dessin',          hexColor: '#C8164A' },
  PHOTOGRAPHIE:     { label: 'Photographie',               hexColor: '#D01848' },
  EXPOSITION:       { label: 'Exposition & Galerie',       hexColor: '#A81040' },
  VERNISSAGE:       { label: 'Vernissage',                 hexColor: '#B80F40' },
  MUSEE:            { label: 'Musée & Patrimoine culturel',hexColor: '#881337' },
  MODE:             { label: 'Mode & Design',              hexColor: '#FF8FA3' },
  LECTURE:          { label: 'Lecture & Littérature',      hexColor: '#F53060' },
  LANCEMENTDELIVRE: { label: 'Lancement de livre',         hexColor: '#FF6381' },

  // ══════════════════════════════════════════════════════════
  // 🏃  Sports & Bien-être — Famille Orange vif
  //     Principal : #F97316
  // ══════════════════════════════════════════════════════════
  TRAIL:                  { label: 'Trail & Course à pied',       hexColor: '#F97316' }, // principal
  SPORT:                  { label: 'Sport & Activité physique',   hexColor: '#EA580C' },
  COMPETITION:            { label: 'Compétition & Tournoi',       hexColor: '#C2410C' },
  RANDONNEE:              { label: 'Randonnée & Trekking',        hexColor: '#9A3412' },
  AVENTURE:               { label: 'Aventure & Outdoor',          hexColor: '#CC5200' },
  OUTDOOR:                { label: 'Plein air & Nature',          hexColor: '#B84800' },
  RENCONTRESPORTIVE:      { label: 'Rencontre sportive',          hexColor: '#BF5500' },
  CYCLISME:               { label: 'Cyclisme & VTT',              hexColor: '#E56010' },
  NATATION:               { label: 'Natation & Sports nautiques', hexColor: '#FF8C3A' },
  NAUTISME:               { label: 'Nautisme & Voile',            hexColor: '#FB923C' },
  NEIGE:                  { label: 'Sports d\'hiver & Neige',     hexColor: '#FFB08C' },
  FITNESS:                { label: 'Fitness & Musculation',       hexColor: '#D45500' },
  YOGA:                   { label: 'Yoga & Respiration',          hexColor: '#FDBA74' },
  PILATES:                { label: 'Pilates & Stretching',        hexColor: '#FFB070' },
  MEDITATION:             { label: 'Méditation & Pleine conscience', hexColor: '#FED7AA' },
  BIENETRE:               { label: 'Bien-être & Relaxation',      hexColor: '#FF9A50' },
  DEVELOPPEMENTPERSONNEL: { label: 'Développement personnel',     hexColor: '#FF7A28' },
  JARDINAGE:              { label: 'Jardinage & Permaculture',    hexColor: '#FFAA5E' },
  FERME:                  { label: 'Ferme & Agriculture',         hexColor: '#E87020' },

  // ══════════════════════════════════════════════════════════
  // 🎮  Loisirs & Divertissements — Famille Indigo / Violet
  //     Principal : #6366F1
  // ══════════════════════════════════════════════════════════
  JEUX:              { label: 'Jeux de société & Plateau',     hexColor: '#6366F1' }, // principal
  FESTIVAL:          { label: 'Festival & Grande fête',        hexColor: '#8B5CF6' },
  SOIREE:            { label: 'Soirée & Bal',                  hexColor: '#A5B4FC' },
  FETELOCALE:        { label: 'Fête locale & Tradition',       hexColor: '#3730A3' },
  FERIA:             { label: 'Féria & Festivités taurines',   hexColor: '#312E81' },
  JOURNEE:           { label: 'Journée thématique & Événement',hexColor: '#6D70F5' },
  JEUXVIDEO:         { label: 'Jeux vidéo & Gaming',           hexColor: '#4F46E5' },
  ESPORT:            { label: 'E-sport & Compétition gaming',  hexColor: '#4338CA' },
  TOURNOIJEUXVIDEO:  { label: 'Tournoi jeux vidéo',            hexColor: '#3B3CB5' },
  SOIREEJEUX:        { label: 'Soirée jeux & Afterwork',       hexColor: '#5A5EE8' },
  JEUXDEROLE:        { label: 'Jeux de rôle & Wargame',        hexColor: '#5248DB' },
  ESCAPEGAME:        { label: 'Escape game & Enquête',         hexColor: '#9395F8' },
  MANGA:             { label: 'Manga & Animé',                 hexColor: '#818CF8' },
  COSPLAY:           { label: 'Cosplay & Déguisement',         hexColor: '#7C3AED' },
  KARAOKE:           { label: 'Karaoké & Scène ouverte',       hexColor: '#B0B3FF' },

  // ══════════════════════════════════════════════════════════
  // 🍽  Gastronomie — Famille Ambre / Doré
  //     Principal : #D97706
  // ══════════════════════════════════════════════════════════
  REPAS:         { label: 'Repas & Dîner gastronomique', hexColor: '#D97706' }, // principal
  COURSDECUISINE:{ label: 'Cours de cuisine & Atelier',  hexColor: '#B45309' },
  DEGUSTATION:   { label: 'Dégustation & Œnologie',      hexColor: '#F59E0B' },
  DEJEUNER:      { label: 'Déjeuner & Table d\'hôte',    hexColor: '#FBBF24' },
  BAR:           { label: 'Bar & Cocktail',              hexColor: '#92400E' },
  BRUNCH:        { label: 'Brunch & Petit-déjeuner',     hexColor: '#E8A208' },
  PIQUENIQUE:    { label: 'Pique-nique & Apéro',         hexColor: '#FCD34D' },
  FOODTRUCK:     { label: 'Food truck & Street food',    hexColor: '#C67C0A' },

  // ══════════════════════════════════════════════════════════
  // 🔬  Savoir & Découverte — Famille Sarcelle / Cyan
  //     Principal : #0D9488
  // ══════════════════════════════════════════════════════════
  CONFERENCE:        { label: 'Conférence & Débat',             hexColor: '#0D9488' }, // principal
  ATELIER:           { label: 'Atelier participatif & Pratique',hexColor: '#0D7A74' },
  FORMATION:         { label: 'Formation & Stage',              hexColor: '#0F766E' },
  LANGUES:           { label: 'Langues & Échanges linguistiques',hexColor: '#14B8A6' },
  SCIENCE:           { label: 'Science & Recherche',            hexColor: '#0891B2' },
  TECHNOLOGIE:       { label: 'Innovation & Numérique',         hexColor: '#06B6D4' },
  NUMERIQUE:         { label: 'Atelier numérique & Coding',     hexColor: '#0CB4A6' },
  DECOUVERTE:        { label: 'Découverte & Exploration',       hexColor: '#2DD4BF' },
  PATRIMOINE:        { label: 'Patrimoine & Histoire locale',   hexColor: '#115E59' },
  VISITE:            { label: 'Visite guidée & Balade',         hexColor: '#134E4A' },
  PHILOSOPHIE:       { label: 'Philosophie & Conférence citoyenne', hexColor: '#0E8078' },
  CREATIVITE:        { label: 'Créativité & Expression artistique', hexColor: '#1CC4B0' },
  BRICOLAGE:         { label: 'Bricolage & DIY',                hexColor: '#0A6E68' },
  SALONPROFESSIONNEL:{ label: 'Salon & Forum professionnel',    hexColor: '#128878' },

  // ══════════════════════════════════════════════════════════
  // 🛒  Marché & Commerce — Famille Brun Ambre
  //     Principal : #B45309
  // ══════════════════════════════════════════════════════════
  MARCHE:       { label: 'Marché & Bazar',            hexColor: '#B45309' }, // principal
  BROCANTE:     { label: 'Brocante & Antiquités',     hexColor: '#92400E' },
  VIDEGRENIER:  { label: 'Vide-grenier & Troc',       hexColor: '#D97706' },
  ENCHERES:     { label: 'Enchères & Vente aux enchères', hexColor: '#78350F' },
  ARTISANAT:    { label: 'Artisanat & Fait main',     hexColor: '#A8520A' },
  SALONARTISANAT:{ label: 'Salon artisanat & Créateurs', hexColor: '#C06010' },

  // ══════════════════════════════════════════════════════════
  // 💚  Causes Sociales & Écologie — Famille Vert
  //     Principal : #16A34A
  // ══════════════════════════════════════════════════════════
  ECOLOGIE:          { label: 'Écologie & Environnement',   hexColor: '#16A34A' }, // principal
  SOLIDARITE:        { label: 'Solidarité & Entraide',      hexColor: '#15803D' },
  BENEVOLAT:         { label: 'Bénévolat & Action collective', hexColor: '#22C55E' },
  ANIMAUX:           { label: 'Animaux & Protection faune', hexColor: '#4ADE80' },
  NATURE:            { label: 'Nature & Biodiversité',      hexColor: '#166534' },
  HUMANITAIRE:       { label: 'Action humanitaire',         hexColor: '#34D399' },
  EVENEMENTCARITATIF:{ label: 'Événement caritatif & Don', hexColor: '#14924A' },
  FAMILLE:           { label: 'Famille & Petite enfance',   hexColor: '#2DB855' },
  RENCONTRE:         { label: 'Rencontre & Lien social',    hexColor: '#1FAD4C' },
};

/**
 * Récupère le label français d'une catégorie
 */
export function getCategoryLabel(category: string): string {
  return EVENT_CATEGORY_CONFIG[category]?.label || category;
}

/**
 * Récupère la couleur hex d'une catégorie
 */
export function getCategoryHexColor(category: string): string {
  return EVENT_CATEGORY_CONFIG[category]?.hexColor || '#3B82F6';
}

/**
 * Dérive une couleur d'ombre depuis la hexColor de la catégorie (20% d'opacité)
 */
export function getCategoryShadowColor(category: string): string {
  const hex = getCategoryHexColor(category);
  return `${hex}33`;
}
