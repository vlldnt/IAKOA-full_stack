// ============================================
// CONFIG
// ============================================
const EMAIL = 'jean.dupont@example.com';
const PASSWORD = 'Password123!';
const COMPANY_ID = '46f0f344-5251-4bd6-b93e-2ab8ae8469c8';
const API_URL = 'http://localhost:3000';

let BEARER_TOKEN = null;

// ============================================
// UTILS RANDOM
// ============================================
function randomDateWithin6Months() {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 6);
  return new Date(now.getTime() + Math.random() * (future - now)).toISOString();
}

function randomPrice() {
  return Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 50) + 5;
}

const EVENT_CATEGORIES = [
  'CONCERT',
  'CINEMA',
  'THEATRE',
  'SPECTACLE',
  'FANFARE',
  'DANSE',
  'COURSDEDANSE',
  'ART',
  'PEINTURE',
  'PHOTOGRAPHIE',
  'EXPOSITION',
  'MUSEE',
  'LANCEMENTDELIVRE',
  'ENFANTS',
  'JEUX',
  'JEUXVIDEO',
  'SOIREEJEUX',
  'LECTURE',
  'REPAS',
  'DEJEUNER',
  'COURSDECUISINE',
  'DEGUSTATION',
  'SOIREE',
  'BAR',
  'FESTIVAL',
  'FETELOCALE',
  'FERIA',
  'NATURE',
  'RANDONNEE',
  'TRAIL',
  'OUTDOOR',
  'MARCHE',
  'NEIGE',
  'NAUTISME',
  'AVENTURE',
  'YOGA',
  'MEDITATION',
  'BIENETRE',
  'DEVELOPPEMENTPERSONNEL',
  'CONFERENCE',
  'FORMATION',
  'LANGUES',
  'SALONPROFESSIONNEL',
  'SCIENCE',
  'DECOUVERTE',
  'PATRIMOINE',
  'VISITE',
  'ATELIER',
  'BRICOLAGE',
  'MODE',
  'ANIMAUX',
  'JARDINAGE',
  'FERME',
  'BENEVOLAT',
  'ECOLOGIE',
  'SOLIDARITE',
  'RENCONTRE',
  'EVENEMENTCARITATIF',
  'ESPORT',
  'TECHNOLOGIE',
  'MANGA',
  'COSPLAY',
  'TOURNOIJEUXVIDEO',
  'BROCANTE',
  'VIDEGRENIER',
  'ENCHERES',
  'SPORT',
  'COMPETITION',
  'RENCONTRESPORTIVE',
  'JOURNEE',
];

// ============================================
// DONNEES PREFECTURES (CENTRE DEPARTEMENT)
// ============================================

const DEPARTMENTS = [
  { code: '01', city: 'Bourg-en-Bresse', lat: 46.205, lng: 5.225, otherCities: [{ name: 'Oyonnax', lat: 46.257, lng: 5.655 }, { name: 'Ambérieu-en-Bugey', lat: 45.959, lng: 5.351 }, { name: 'Gex', lat: 46.333, lng: 6.057 }] },
  { code: '02', city: 'Laon', lat: 49.563, lng: 3.621, otherCities: [{ name: 'Saint-Quentin', lat: 49.851, lng: 3.283 }, { name: 'Château-Thierry', lat: 48.97, lng: 3.399 }, { name: 'Hirson', lat: 49.928, lng: 4.096 }] },
  { code: '03', city: 'Moulins', lat: 46.566, lng: 3.333, otherCities: [{ name: 'Montluçon', lat: 46.337, lng: 2.644 }, { name: 'Vichy', lat: 46.124, lng: 3.425 }, { name: 'Cusset', lat: 46.118, lng: 3.449 }] },
  { code: '04', city: 'Digne-les-Bains', lat: 44.092, lng: 6.235, otherCities: [{ name: 'Manosque', lat: 43.837, lng: 5.787 }, { name: 'Sisteron', lat: 44.188, lng: 5.736 }, { name: 'Oraison', lat: 43.939, lng: 5.623 }] },
  { code: '05', city: 'Gap', lat: 44.559, lng: 6.078, otherCities: [{ name: 'Briançon', lat: 44.901, lng: 6.639 }, { name: 'Embrun', lat: 44.566, lng: 6.494 }, { name: 'Laragne-Montéglin', lat: 44.378, lng: 5.926 }] },
  { code: '06', city: 'Nice', lat: 43.71, lng: 7.262, otherCities: [{ name: 'Cannes', lat: 43.553, lng: 7.017 }, { name: 'Antibes', lat: 43.584, lng: 7.124 }, { name: 'Menton', lat: 43.77, lng: 7.51 }] },
  { code: '07', city: 'Privas', lat: 44.735, lng: 4.599, otherCities: [{ name: 'Aubenas', lat: 44.616, lng: 4.391 }, { name: 'Annonay', lat: 45.236, lng: 4.666 }, { name: 'Le Pouzin', lat: 44.897, lng: 4.674 }] },
  { code: '08', city: 'Charleville-Mézières', lat: 49.773, lng: 4.72, otherCities: [{ name: 'Sedan', lat: 49.707, lng: 4.438 }, { name: 'Rethel', lat: 49.502, lng: 4.568 }, { name: 'Bogny-sur-Meuse', lat: 49.828, lng: 4.754 }] },
  { code: '09', city: 'Foix', lat: 42.965, lng: 1.607, otherCities: [{ name: 'Pamiers', lat: 43.11, lng: 1.599 }, { name: 'Tarascon-sur-Ariège', lat: 42.845, lng: 1.691 }, { name: 'Lavelanet', lat: 42.829, lng: 1.823 }] },
  { code: '10', city: 'Troyes', lat: 48.297, lng: 4.074, otherCities: [{ name: 'Romilly-sur-Seine', lat: 48.517, lng: 3.74 }, { name: 'Nogent-sur-Seine', lat: 48.456, lng: 3.49 }, { name: 'Arcis-sur-Aube', lat: 48.405, lng: 3.986 }] },
  { code: '11', city: 'Carcassonne', lat: 43.213, lng: 2.352, otherCities: [{ name: 'Narbonne', lat: 43.184, lng: 2.973 }, { name: 'Limoux', lat: 43.064, lng: 2.226 }, { name: 'Castelnaudary', lat: 43.341, lng: 1.944 }] },
  { code: '12', city: 'Rodez', lat: 44.351, lng: 2.575, otherCities: [{ name: 'Millau', lat: 44.003, lng: 3.014 }, { name: 'Villefranche-de-Rouergue', lat: 44.417, lng: 1.732 }, { name: 'Decazeville', lat: 44.573, lng: 2.287 }] },
  { code: '13', city: 'Marseille', lat: 43.296, lng: 5.369, otherCities: [{ name: 'Aix-en-Provence', lat: 43.53, lng: 5.447 }, { name: 'Arles', lat: 43.678, lng: 4.627 }, { name: 'Salon-de-Provence', lat: 43.641, lng: 5.093 }] },
  { code: '14', city: 'Caen', lat: 49.182, lng: -0.37, otherCities: [{ name: 'Cherbourg-Octeville', lat: 49.633, lng: -1.633 }, { name: 'Bayeux', lat: 49.277, lng: -0.702 }, { name: 'Deauville', lat: 49.348, lng: 0.084 }] },
  { code: '15', city: 'Aurillac', lat: 44.926, lng: 2.44, otherCities: [{ name: 'Saint-Flour', lat: 45.031, lng: 3.195 }, { name: 'Mauriac', lat: 45.246, lng: 2.065 }, { name: 'Murat', lat: 45.034, lng: 3.088 }] },
  { code: '16', city: 'Angoulême', lat: 45.648, lng: 0.156, otherCities: [{ name: 'Cognac', lat: 45.674, lng: -0.333 }, { name: 'Barbezieux-Saint-Hilaire', lat: 45.47, lng: -0.172 }, { name: 'Jarnac', lat: 45.685, lng: -0.195 }] },
  { code: '17', city: 'La Rochelle', lat: 46.16, lng: -1.151, otherCities: [{ name: 'Rochefort', lat: 45.927, lng: -0.965 }, { name: 'Saintes', lat: 45.744, lng: -0.636 }, { name: 'Saint-Jean-d\'Angély', lat: 45.877, lng: -0.553 }] },
  { code: '18', city: 'Bourges', lat: 47.081, lng: 2.398, otherCities: [{ name: 'Vierzon', lat: 47.222, lng: 2.066 }, { name: 'Saint-Amand-Montrond', lat: 46.714, lng: 2.502 }, { name: 'Issoudun', lat: 47.062, lng: 1.994 }] },
  { code: '19', city: 'Tulle', lat: 45.267, lng: 1.772, otherCities: [{ name: 'Brive-la-Gaillarde', lat: 45.141, lng: 1.53 }, { name: 'Ussel', lat: 45.54, lng: 2.311 }, { name: 'Objat', lat: 45.22, lng: 1.565 }] },
  { code: '2A', city: 'Ajaccio', lat: 41.919, lng: 8.738, otherCities: [{ name: 'Sartène', lat: 41.615, lng: 8.846 }, { name: 'Bonifacio', lat: 41.392, lng: 9.159 }, { name: 'Propriano', lat: 41.673, lng: 8.895 }] },
  { code: '2B', city: 'Bastia', lat: 42.702, lng: 9.45, otherCities: [{ name: 'Corte', lat: 42.306, lng: 9.152 }, { name: 'Calvi', lat: 42.567, lng: 8.764 }, { name: 'L\'Île-Rousse', lat: 42.637, lng: 8.931 }] },
  { code: '21', city: 'Dijon', lat: 47.322, lng: 5.041, otherCities: [{ name: 'Beaune', lat: 47.022, lng: 4.837 }, { name: 'Montbard', lat: 47.605, lng: 4.339 }, { name: 'Châtillon-sur-Seine', lat: 47.874, lng: 4.587 }] },
  { code: '22', city: 'Saint-Brieuc', lat: 48.514, lng: -2.765, otherCities: [{ name: 'Dinan', lat: 48.456, lng: -2.046 }, { name: 'Guingamp', lat: 48.568, lng: -3.155 }, { name: 'Lannion', lat: 48.731, lng: -3.456 }] },
  { code: '23', city: 'Guéret', lat: 46.171, lng: 1.871, otherCities: [{ name: 'Aubusson', lat: 45.957, lng: 2.172 }, { name: 'Felletin', lat: 45.869, lng: 2.265 }, { name: 'La Souterraine', lat: 46.386, lng: 1.498 }] },
  { code: '24', city: 'Périgueux', lat: 45.184, lng: 0.721, otherCities: [{ name: 'Bergerac', lat: 44.864, lng: 0.487 }, { name: 'Sarlat-la-Canéda', lat: 44.887, lng: 1.229 }, { name: 'Riberac', lat: 45.251, lng: 0.224 }] },
  { code: '25', city: 'Besançon', lat: 47.238, lng: 6.024, otherCities: [{ name: 'Montbéliard', lat: 47.509, lng: 6.798 }, { name: 'Pontarlier', lat: 46.906, lng: 6.345 }, { name: 'Morteau', lat: 46.816, lng: 6.575 }] },
  { code: '26', city: 'Valence', lat: 44.933, lng: 4.892, otherCities: [{ name: 'Montélimar', lat: 44.561, lng: 4.749 }, { name: 'Romans-sur-Isère', lat: 45.042, lng: 5.041 }, { name: 'Die', lat: 44.766, lng: 5.769 }] },
  { code: '27', city: 'Évreux', lat: 49.024, lng: 1.15, otherCities: [{ name: 'Vernon', lat: 49.087, lng: 1.486 }, { name: 'Gisors', lat: 49.225, lng: 1.76 }, { name: 'Pont-Audemer', lat: 49.358, lng: 0.513 }] },
  { code: '28', city: 'Chartres', lat: 48.446, lng: 1.489, otherCities: [{ name: 'Châteaudun', lat: 47.971, lng: 1.327 }, { name: 'Dreux', lat: 48.74, lng: 1.373 }, { name: 'Nogent-le-Rotrou', lat: 48.315, lng: 0.812 }] },
  { code: '29', city: 'Quimper', lat: 47.996, lng: -4.102, otherCities: [{ name: 'Brest', lat: 48.39, lng: -4.486 }, { name: 'Morlaix', lat: 48.588, lng: -3.832 }, { name: 'Douarnenez', lat: 48.096, lng: -4.336 }] },
  { code: '30', city: 'Nîmes', lat: 43.837, lng: 4.36, otherCities: [{ name: 'Alès', lat: 44.125, lng: 4.086 }, { name: 'Uzès', lat: 44.005, lng: 4.416 }, { name: 'Beaucaire', lat: 43.839, lng: 4.631 }] },
  { code: '31', city: 'Toulouse', lat: 43.604, lng: 1.444, otherCities: [{ name: 'Blagnac', lat: 43.633, lng: 1.395 }, { name: 'Colomiers', lat: 43.606, lng: 1.338 }, { name: 'Tournefeuille', lat: 43.555, lng: 1.367 }] },
  { code: '32', city: 'Auch', lat: 43.646, lng: 0.585, otherCities: [{ name: 'Condom', lat: 43.976, lng: 0.371 }, { name: 'Fleurance', lat: 43.82, lng: 0.711 }, { name: 'Lombez', lat: 43.268, lng: 0.993 }] },
  { code: '33', city: 'Bordeaux', lat: 44.837, lng: -0.579, otherCities: [{ name: 'Mérignac', lat: 44.833, lng: -0.656 }, { name: 'Pessac', lat: 44.797, lng: -0.704 }, { name: 'Talence', lat: 44.802, lng: -0.626 }] },
  { code: '34', city: 'Montpellier', lat: 43.611, lng: 3.876, otherCities: [{ name: 'Sète', lat: 43.396, lng: 3.694 }, { name: 'Agde', lat: 43.309, lng: 3.464 }, { name: 'Béziers', lat: 43.343, lng: 3.228 }] },
  { code: '35', city: 'Rennes', lat: 48.117, lng: -1.677, otherCities: [{ name: 'Saint-Malo', lat: 48.648, lng: -2.026 }, { name: 'Fougères', lat: 48.349, lng: -1.199 }, { name: 'Vitré', lat: 47.791, lng: -1.206 }] },
  { code: '36', city: 'Châteauroux', lat: 46.811, lng: 1.691, otherCities: [{ name: 'Issoudun', lat: 47.062, lng: 1.994 }, { name: 'Argenton-sur-Creuse', lat: 46.632, lng: 1.504 }, { name: 'Le Blanc', lat: 46.707, lng: 0.728 }] },
  { code: '37', city: 'Tours', lat: 47.394, lng: 0.684, otherCities: [{ name: 'Amboise', lat: 47.413, lng: 0.982 }, { name: 'Joué-lès-Tours', lat: 47.341, lng: 0.68 }, { name: 'Loches', lat: 47.126, lng: 0.998 }] },
  { code: '38', city: 'Grenoble', lat: 45.188, lng: 5.724, otherCities: [{ name: 'Échirolles', lat: 45.156, lng: 5.709 }, { name: 'Saint-Martin-d\'Hères', lat: 45.169, lng: 5.766 }, { name: 'Voiron', lat: 45.365, lng: 5.593 }] },
  { code: '39', city: 'Lons-le-Saunier', lat: 46.675, lng: 5.553, otherCities: [{ name: 'Dole', lat: 47.099, lng: 5.496 }, { name: 'Saint-Claude', lat: 46.387, lng: 5.858 }, { name: 'Champagnole', lat: 46.756, lng: 5.888 }] },
  { code: '40', city: 'Mont-de-Marsan', lat: 43.891, lng: -0.497, otherCities: [{ name: 'Dax', lat: 43.713, lng: -1.047 }, { name: 'Mimizan', lat: 44.222, lng: -1.295 }, { name: 'Saint-Sever', lat: 43.761, lng: -0.697 }] },
  { code: '41', city: 'Blois', lat: 47.586, lng: 1.335, otherCities: [{ name: 'Romorantin-Lanthenay', lat: 47.259, lng: 1.748 }, { name: 'Vendôme', lat: 47.804, lng: 0.873 }, { name: 'Montrichard', lat: 47.361, lng: 1.173 }] },
  { code: '42', city: 'Saint-Étienne', lat: 45.439, lng: 4.387, otherCities: [{ name: 'Montbrison', lat: 45.609, lng: 4.066 }, { name: 'Roanne', lat: 46.034, lng: 4.069 }, { name: 'Saint-Chamond', lat: 45.468, lng: 4.514 }] },
  { code: '43', city: 'Le Puy-en-Velay', lat: 45.043, lng: 3.885, otherCities: [{ name: 'Brioude', lat: 45.293, lng: 3.368 }, { name: 'Yssingeaux', lat: 45.315, lng: 4.065 }, { name: 'Saint-Didier-en-Velay', lat: 45.249, lng: 4.009 }] },
  { code: '44', city: 'Nantes', lat: 47.218, lng: -1.553, otherCities: [{ name: 'Saint-Nazaire', lat: 47.278, lng: -2.207 }, { name: 'Saint-Herblain', lat: 47.282, lng: -1.524 }, { name: 'Rezé', lat: 47.172, lng: -1.536 }] },
  { code: '45', city: 'Orléans', lat: 47.903, lng: 1.909, otherCities: [{ name: 'Montargis', lat: 47.992, lng: 2.738 }, { name: 'Pithiviers', lat: 48.169, lng: 2.263 }, { name: 'Fleury-les-Aubrais', lat: 47.927, lng: 1.857 }] },
  { code: '46', city: 'Cahors', lat: 44.447, lng: 1.44, otherCities: [{ name: 'Figeac', lat: 44.612, lng: 2.033 }, { name: 'Gourdon', lat: 44.742, lng: 1.386 }, { name: 'Gramat', lat: 44.747, lng: 1.724 }] },
  { code: '47', city: 'Agen', lat: 44.204, lng: 0.621, otherCities: [{ name: 'Villeneuve-sur-Lot', lat: 44.408, lng: 0.704 }, { name: 'Nérac', lat: 44.136, lng: 0.344 }, { name: 'Marmande', lat: 44.502, lng: 0.163 }] },
  { code: '48', city: 'Mende', lat: 44.518, lng: 3.499, otherCities: [{ name: 'Florac', lat: 44.33, lng: 3.591 }, { name: 'Marvejols', lat: 44.697, lng: 3.367 }, { name: 'Langogne', lat: 44.73, lng: 3.878 }] },
  { code: '49', city: 'Angers', lat: 47.478, lng: -0.563, otherCities: [{ name: 'Cholet', lat: 47.063, lng: -0.878 }, { name: 'Saumur', lat: 47.261, lng: -0.083 }, { name: 'Segré-en-Anjou-Bleu', lat: 47.605, lng: -0.879 }] },
  { code: '50', city: 'Saint-Lô', lat: 49.115, lng: -1.09, otherCities: [{ name: 'Cherbourg-Octeville', lat: 49.633, lng: -1.633 }, { name: 'Avranches', lat: 48.68, lng: -1.362 }, { name: 'Coutances', lat: 49.044, lng: -1.429 }] },
  { code: '51', city: 'Châlons-en-Champagne', lat: 48.956, lng: 4.367, otherCities: [{ name: 'Reims', lat: 49.258, lng: 4.031 }, { name: 'Épernay', lat: 49.04, lng: 3.957 }, { name: 'Vitry-le-François', lat: 48.727, lng: 4.717 }] },
  { code: '52', city: 'Chaumont', lat: 48.111, lng: 5.138, otherCities: [{ name: 'Saint-Dizier', lat: 48.638, lng: 4.953 }, { name: 'Langres', lat: 47.872, lng: 5.337 }, { name: 'Bourbonne-les-Bains', lat: 47.983, lng: 5.761 }] },
  { code: '53', city: 'Laval', lat: 48.07, lng: -0.772, otherCities: [{ name: 'Mayenne', lat: 48.309, lng: -0.627 }, { name: 'Château-Gontier-sur-Mayenne', lat: 47.832, lng: -0.707 }, { name: 'Changé', lat: 48.058, lng: -0.75 }] },
  { code: '54', city: 'Nancy', lat: 48.692, lng: 6.184, otherCities: [{ name: 'Briey', lat: 49.231, lng: 5.887 }, { name: 'Toul', lat: 48.675, lng: 5.899 }, { name: 'Villerupt', lat: 49.436, lng: 5.816 }] },
  { code: '55', city: 'Bar-le-Duc', lat: 48.772, lng: 5.161, otherCities: [{ name: 'Commercy', lat: 48.78, lng: 5.591 }, { name: 'Verdun', lat: 49.163, lng: 5.393 }, { name: 'Saint-Mihiel', lat: 48.864, lng: 5.65 }] },
  { code: '56', city: 'Vannes', lat: 47.658, lng: -2.76, otherCities: [{ name: 'Lorient', lat: 47.747, lng: -3.357 }, { name: 'Pontivy', lat: 48.069, lng: -3.363 }, { name: 'Auray', lat: 47.668, lng: -3.007 }] },
  { code: '57', city: 'Metz', lat: 49.119, lng: 6.175, otherCities: [{ name: 'Sarreguemines', lat: 49.104, lng: 7.066 }, { name: 'Thionville', lat: 49.358, lng: 6.164 }, { name: 'Forbach', lat: 49.184, lng: 6.896 }] },
  { code: '58', city: 'Nevers', lat: 46.989, lng: 3.159, otherCities: [{ name: 'Château-Chinon', lat: 47.255, lng: 3.916 }, { name: 'Clamecy', lat: 47.456, lng: 3.512 }, { name: 'Decize', lat: 46.894, lng: 3.453 }] },
  { code: '59', city: 'Lille', lat: 50.629, lng: 3.057, otherCities: [{ name: 'Roubaix', lat: 50.692, lng: 3.173 }, { name: 'Tourcoing', lat: 50.728, lng: 3.159 }, { name: 'Dunkerque', lat: 51.034, lng: 2.376 }] },
  { code: '60', city: 'Beauvais', lat: 49.43, lng: 2.082, otherCities: [{ name: 'Compiègne', lat: 49.421, lng: 2.826 }, { name: 'Senlis', lat: 49.207, lng: 2.589 }, { name: 'Creil', lat: 49.234, lng: 2.483 }] },
  { code: '61', city: 'Alençon', lat: 48.431, lng: 0.091, otherCities: [{ name: 'Mortagne-au-Perche', lat: 48.537, lng: 0.548 }, { name: 'Argentan', lat: 48.745, lng: 0.02 }, { name: 'Flers', lat: 48.741, lng: -0.557 }] },
  { code: '62', city: 'Arras', lat: 50.291, lng: 2.777, otherCities: [{ name: 'Béthune', lat: 50.532, lng: 2.643 }, { name: 'Boulogne-sur-Mer', lat: 50.729, lng: 1.613 }, { name: 'Calais', lat: 50.953, lng: 1.857 }] },
  { code: '63', city: 'Clermont-Ferrand', lat: 45.777, lng: 3.087, otherCities: [{ name: 'Riom', lat: 45.889, lng: 3.107 }, { name: 'Issoire', lat: 45.541, lng: 3.242 }, { name: 'Thiers', lat: 45.854, lng: 3.854 }] },
  { code: '64', city: 'Pau', lat: 43.295, lng: -0.37, otherCities: [{ name: 'Bayonne', lat: 43.493, lng: -1.475 }, { name: 'Biarritz', lat: 43.479, lng: -1.558 }, { name: 'Oloron-Sainte-Marie', lat: 43.19, lng: -0.613 }] },
  { code: '65', city: 'Tarbes', lat: 43.232, lng: 0.078, otherCities: [{ name: 'Lourdes', lat: 43.098, lng: -0.047 }, { name: 'Argelès-Gazost', lat: 43.009, lng: -0.121 }, { name: 'Bagnères-de-Bigorre', lat: 43.063, lng: 0.154 }] },
  { code: '66', city: 'Perpignan', lat: 42.688, lng: 2.894, otherCities: [{ name: 'Céret', lat: 42.521, lng: 2.738 }, { name: 'Prades', lat: 42.599, lng: 2.441 }, { name: 'Canet-en-Roussillon', lat: 42.673, lng: 3.029 }] },
  { code: '67', city: 'Strasbourg', lat: 48.573, lng: 7.752, otherCities: [{ name: 'Haguenau', lat: 48.812, lng: 7.789 }, { name: 'Saverne', lat: 48.744, lng: 7.357 }, { name: 'Sélestat', lat: 48.259, lng: 7.451 }] },
  { code: '68', city: 'Colmar', lat: 48.079, lng: 7.358, otherCities: [{ name: 'Mulhouse', lat: 47.751, lng: 7.34 }, { name: 'Guebwiller', lat: 47.903, lng: 7.193 }, { name: 'Riedisheim', lat: 47.769, lng: 7.34 }] },
  { code: '69', city: 'Lyon', lat: 45.764, lng: 4.835, otherCities: [{ name: 'Villeurbanne', lat: 45.768, lng: 4.873 }, { name: 'Décines-Charpieu', lat: 45.716, lng: 4.975 }, { name: 'Saint-Priest', lat: 45.705, lng: 4.928 }] },
  { code: '70', city: 'Vesoul', lat: 47.624, lng: 6.155, otherCities: [{ name: 'Lure', lat: 47.719, lng: 6.509 }, { name: 'Gray', lat: 47.436, lng: 5.558 }, { name: 'Luxeuil-les-Bains', lat: 47.819, lng: 6.379 }] },
  { code: '71', city: 'Mâcon', lat: 46.306, lng: 4.828, otherCities: [{ name: 'Chalon-sur-Saône', lat: 46.781, lng: 4.856 }, { name: 'Autun', lat: 46.956, lng: 4.298 }, { name: 'Le Creusot', lat: 46.864, lng: 4.629 }] },
  { code: '72', city: 'Le Mans', lat: 48.006, lng: 0.199, otherCities: [{ name: 'Saint-Saturnin', lat: 48.031, lng: 0.189 }, { name: 'Coulaines', lat: 48.028, lng: 0.219 }, { name: 'La Flèche', lat: 47.694, lng: 0.075 }] },
  { code: '73', city: 'Chambéry', lat: 45.564, lng: 5.917, otherCities: [{ name: 'Albertville', lat: 45.677, lng: 6.392 }, { name: 'Aix-les-Bains', lat: 45.686, lng: 5.909 }, { name: 'Saint-Jean-de-Maurienne', lat: 45.288, lng: 6.357 }] },
  { code: '74', city: 'Annecy', lat: 45.899, lng: 6.129, otherCities: [{ name: 'Chamonix-Mont-Blanc', lat: 45.928, lng: 6.87 }, { name: 'Thonon-les-Bains', lat: 46.369, lng: 6.481 }, { name: 'Seynod', lat: 45.867, lng: 6.076 }] },
  { code: '75', city: 'Paris', lat: 48.856, lng: 2.352, otherCities: [{ name: 'Boulogne-Billancourt', lat: 48.835, lng: 2.239 }, { name: 'Neuilly-sur-Seine', lat: 48.883, lng: 2.267 }, { name: 'Levallois-Perret', lat: 48.896, lng: 2.307 }] },
  { code: '76', city: 'Rouen', lat: 49.443, lng: 1.099, otherCities: [{ name: 'Dieppe', lat: 49.927, lng: 1.076 }, { name: 'Le Havre', lat: 49.494, lng: 0.107 }, { name: 'Sotteville-lès-Rouen', lat: 49.385, lng: 1.102 }] },
  { code: '77', city: 'Melun', lat: 48.539, lng: 2.655, otherCities: [{ name: 'Meaux', lat: 48.956, lng: 2.878 }, { name: 'Provins', lat: 48.562, lng: 3.293 }, { name: 'Fontainebleau', lat: 48.405, lng: 2.696 }] },
  { code: '78', city: 'Versailles', lat: 48.804, lng: 2.12, otherCities: [{ name: 'Saint-Quentin-en-Yvelines', lat: 48.777, lng: 2.047 }, { name: 'Poissy', lat: 48.929, lng: 2.058 }, { name: 'Rambouillet', lat: 48.633, lng: 1.824 }] },
  { code: '79', city: 'Niort', lat: 46.325, lng: -0.458, otherCities: [{ name: 'Bressuire', lat: 47.063, lng: -0.489 }, { name: 'Thouars', lat: 47.211, lng: -0.2 }, { name: 'Parthenay', lat: 46.647, lng: -0.254 }] },
  { code: '80', city: 'Amiens', lat: 49.894, lng: 2.295, otherCities: [{ name: 'Abbeville', lat: 50.109, lng: 1.834 }, { name: 'Albert', lat: 50.181, lng: 2.654 }, { name: 'Péronne', lat: 49.883, lng: 2.944 }] },
  { code: '81', city: 'Albi', lat: 43.927, lng: 2.148, otherCities: [{ name: 'Castres', lat: 43.608, lng: 2.239 }, { name: 'Gaillac', lat: 43.888, lng: 1.898 }, { name: 'Lavaur', lat: 43.648, lng: 1.826 }] },
  { code: '82', city: 'Montauban', lat: 44.017, lng: 1.355, otherCities: [{ name: 'Castelsarrasin', lat: 44.076, lng: 1.12 }, { name: 'Moissac', lat: 44.104, lng: 0.881 }, { name: 'Valence-d\'Agen', lat: 44.302, lng: 0.851 }] },
  { code: '83', city: 'Toulon', lat: 43.124, lng: 5.928, otherCities: [{ name: 'Brignoles', lat: 43.404, lng: 6.064 }, { name: 'Draguignan', lat: 43.536, lng: 6.465 }, { name: 'La Seyne-sur-Mer', lat: 43.093, lng: 5.863 }] },
  { code: '84', city: 'Avignon', lat: 43.949, lng: 4.805, otherCities: [{ name: 'Apt', lat: 43.86, lng: 5.394 }, { name: 'Carpentras', lat: 44.057, lng: 5.047 }, { name: 'Isle-sur-la-Sorgue', lat: 43.915, lng: 5.06 }] },
  { code: '85', city: 'La Roche-sur-Yon', lat: 46.67, lng: -1.426, otherCities: [{ name: 'Fontenay-le-Comte', lat: 46.462, lng: -0.793 }, { name: 'Challans', lat: 46.832, lng: -1.883 }, { name: 'Les Herbiers', lat: 46.87, lng: -1.381 }] },
  { code: '86', city: 'Poitiers', lat: 46.58, lng: 0.34, otherCities: [{ name: 'Châtellerault', lat: 46.81, lng: 0.895 }, { name: 'Montmorillon', lat: 46.435, lng: 0.845 }, { name: 'Civray', lat: 46.282, lng: 0.538 }] },
  { code: '87', city: 'Limoges', lat: 45.833, lng: 1.261, otherCities: [{ name: 'Saint-Junien', lat: 45.896, lng: 0.891 }, { name: 'Saint-Léonard-de-Noblat', lat: 45.824, lng: 1.485 }, { name: 'Bellac', lat: 46.133, lng: 1.067 }] },
  { code: '88', city: 'Épinal', lat: 48.174, lng: 6.449, otherCities: [{ name: 'Saint-Dié-des-Vosges', lat: 48.273, lng: 6.941 }, { name: 'Gérardmer', lat: 48.072, lng: 6.863 }, { name: 'Remiremont', lat: 47.996, lng: 6.591 }] },
  { code: '89', city: 'Auxerre', lat: 47.797, lng: 3.573, otherCities: [{ name: 'Avallon', lat: 47.496, lng: 3.904 }, { name: 'Sens', lat: 48.197, lng: 3.285 }, { name: 'Joigny', lat: 47.967, lng: 3.402 }] },
  { code: '90', city: 'Belfort', lat: 47.637, lng: 6.863, otherCities: [{ name: 'Sevenans', lat: 47.611, lng: 6.858 }, { name: 'Offemont', lat: 47.652, lng: 6.821 }, { name: 'Giromagny', lat: 47.739, lng: 6.816 }] },
  { code: '91', city: 'Évry', lat: 48.632, lng: 2.44, otherCities: [{ name: 'Corbeil-Essonnes', lat: 48.609, lng: 2.485 }, { name: 'Massy', lat: 48.729, lng: 2.269 }, { name: 'Longjumeau', lat: 48.684, lng: 2.289 }] },
  { code: '92', city: 'Nanterre', lat: 48.892, lng: 2.206, otherCities: [{ name: 'Boulogne-Billancourt', lat: 48.835, lng: 2.239 }, { name: 'Asnières-sur-Seine', lat: 48.916, lng: 2.286 }, { name: 'Gennevilliers', lat: 48.925, lng: 2.29 }] },
  { code: '93', city: 'Bobigny', lat: 48.909, lng: 2.439, otherCities: [{ name: 'Saint-Denis', lat: 48.936, lng: 2.358 }, { name: 'Aubervilliers', lat: 48.909, lng: 2.384 }, { name: 'Montreuil', lat: 48.864, lng: 2.434 }] },
  { code: '94', city: 'Créteil', lat: 48.79, lng: 2.455, otherCities: [{ name: 'Alfortville', lat: 48.796, lng: 2.421 }, { name: 'Villejuif', lat: 48.802, lng: 2.365 }, { name: 'Ivry-sur-Seine', lat: 48.814, lng: 2.382 }] },
  { code: '95', city: 'Cergy', lat: 49.036, lng: 2.076, otherCities: [{ name: 'Argenteuil', lat: 48.955, lng: 2.246 }, { name: 'Pontoise', lat: 49.054, lng: 2.098 }, { name: 'Taverny', lat: 49.012, lng: 2.227 }] },

  // OUTRE MER
  { code: '971', city: 'Basse-Terre', lat: 16.0, lng: -61.732, otherCities: [{ name: 'Pointe-à-Pitre', lat: 16.252, lng: -61.531 }, { name: 'Abymes', lat: 16.254, lng: -61.517 }, { name: 'Baie-Mahault', lat: 16.252, lng: -61.549 }] },
  { code: '972', city: 'Fort-de-France', lat: 14.616, lng: -61.058, otherCities: [{ name: 'Schœlcher', lat: 14.634, lng: -61.163 }, { name: 'Lamentin', lat: 14.652, lng: -61.019 }, { name: 'Ducos', lat: 14.531, lng: -61.034 }] },
  { code: '973', city: 'Cayenne', lat: 4.933, lng: -52.33, otherCities: [{ name: 'Remire-Montjoly', lat: 4.874, lng: -52.248 }, { name: 'Matoury', lat: 4.835, lng: -52.318 }, { name: 'Kourou', lat: 5.168, lng: -52.646 }] },
  { code: '974', city: 'Saint-Denis', lat: -20.882, lng: 55.45, otherCities: [{ name: 'Saint-Paul', lat: -21.002, lng: 55.269 }, { name: 'Saint-Benoît', lat: -20.846, lng: 55.681 }, { name: 'Le Tampon', lat: -21.256, lng: 55.388 }] },
  { code: '976', city: 'Mamoudzou', lat: -12.782, lng: 45.228, otherCities: [{ name: 'Dzaoudzi', lat: -12.799, lng: 45.279 }, { name: 'Koungou', lat: -12.841, lng: 45.258 }, { name: 'Ouangani', lat: -12.737, lng: 45.237 }] },

  // COM
  { code: '987', city: 'Papeete', lat: -17.551, lng: -149.558, otherCities: [{ name: 'Arue', lat: -17.564, lng: -149.597 }, { name: 'Punaauia', lat: -17.617, lng: -149.588 }, { name: 'Pirae', lat: -17.522, lng: -149.548 }] },
  { code: '988', city: 'Nouméa', lat: -22.275, lng: 166.458, otherCities: [{ name: 'Dumbéa', lat: -22.367, lng: 166.404 }, { name: 'Mont-Dore', lat: -22.405, lng: 166.646 }, { name: 'Paita', lat: -22.04, lng: 166.068 }] },
  { code: '986', city: 'Mata-Utu', lat: -13.281, lng: -176.174, otherCities: [{ name: 'Alo', lat: -13.397, lng: -176.209 }, { name: 'Sigave', lat: -13.207, lng: -176.254 }, { name: 'Halalo', lat: -13.306, lng: -176.106 }] },
];

// ============================================
// UTILS RANDOM
// ============================================

function randomCategories() {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...EVENT_CATEGORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================
// GENERATION EVENTS
// ============================================

let img = 1;

function createEvent(city, lat, lng) {
  return {
    name: `Evènement ville de ${city}`,
    date: randomDateWithin6Months(),
    description:
      'Grand évènement festif avec animations, spectacles, gastronomie locale et activités pour tous.',
    pricing: randomPrice(),
    location: {
      address: `Centre-ville, ${city}`,
      city,
      postalCode: '00000',
      country: 'France',
      coordinates: { lat, lng },
    },
    categories: randomCategories(),
    media: [
      {
        url: `https://picsum.photos/400?random=${img++}`,
        type: 'image/jpeg',
      },
    ],
  };
}

function generateFrenchEvents() {
  const events = [];
  for (const d of DEPARTMENTS) {
    events.push(createEvent(d.city, d.lat, d.lng));
    for (const othercity of d.otherCities) {
      events.push(createEvent(othercity.name, othercity.lat, othercity.lng));
    }
  }
  return events;
}

const events = generateFrenchEvents();

// ============================================
// LOGIN
// ============================================
async function login() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = await res.json();
  if (res.ok) {
    BEARER_TOKEN = data.access_token;
    return true;
  }
  return false;
}

// ============================================
// CREATE EVENTS
// ============================================
async function createEvents() {
  for (const event of events) {
    await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify({ ...event, companyId: COMPANY_ID }),
    });
    console.log('✓', event.name);
  }
}

// ============================================
async function main() {
  if (await login()) await createEvents();
}
main();
