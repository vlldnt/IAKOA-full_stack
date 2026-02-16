// ============================================
// VARIABLES A MODIFIER AVANT CHAQUE EXECUTION
// ============================================
const EMAIL = 'jean.dupont@example.com';
const PASSWORD = 'Password123!';
const COMPANY_ID = '46f0f344-5251-4bd6-b93e-2ab8ae8469c8';
const API_URL = 'http://localhost:3000';

let BEARER_TOKEN = null;

// ============================================
// EVENEMENTS A CREER - LOCALISES A RODEZ (12000)
// ============================================
const events = [
  {
    name: 'Concert de Jazz à la Cathédrale',
    date: '2025-07-15T20:30:00Z',
    description: 'Une soirée jazz mémorable dans le cadre prestigieux de la Cathédrale de Rodez. Musique live, ambiance intimiste et magique.',
    pricing: 2000,
    location: {
      address: 'Cathédrale Notre-Dame, Place d\'Armes',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3543, lng: 2.5747 },
    },
    website: 'https://rodez-concerts.fr/jazz',
    categories: ['CONCERT', 'SOIREE', 'CULTURE'],
    media: [
      { url: 'https://picsum.photos/400?random=1', type: 'image/jpeg' },
      { url: 'https://picsum.photos/400?random=2', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Festival Estival du Vieux Rodez',
    date: '2025-08-10T18:00:00Z',
    description: 'Festival d\'été mêlant musique, théâtre et spectacles en plein air dans les ruelles pittoresques du vieux Rodez. Installations artistiques et animations.',
    pricing: 1200,
    location: {
      address: 'Rue de l\'Embergue, Vieux Rodez',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3520, lng: 2.5730 },
    },
    categories: ['FESTIVAL', 'ART', 'SPECTACLE'],
    media: [
      { url: 'https://picsum.photos/400?random=3', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Randonnée Pédestre en Aveyron',
    date: '2025-06-15T08:00:00Z',
    description: 'Randonnée guidée à travers les paysages typiques de l\'Aveyron. Découverte de la nature, des villages médiévaux et des points de vue panoramiques.',
    pricing: 600,
    location: {
      address: 'Avenue Tarayre, Départ Lac de Vézins',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3480, lng: 2.6200 },
    },
    categories: ['RANDONNEE', 'NATURE', 'OUTDOOR'],
    media: [
      { url: 'https://picsum.photos/400?random=4', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Atelier de Cuisine Aveyronnaise',
    date: '2025-07-12T10:00:00Z',
    description: 'Apprenez à préparer les délices culinaires locaux : aligot, tripoux, cheese rouergue. Dégustation incluse avec vin local de la région.',
    pricing: 5000,
    location: {
      address: '12 Boulevard Giscard d\'Estaing',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3590, lng: 2.5800 },
    },
    categories: ['COURSDECUISINE', 'DEGUSTATION', 'REPAS'],
    media: [
      { url: 'https://picsum.photos/400?random=5', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Soirée Jeux au Cœur de Rodez',
    date: '2025-06-28T19:00:00Z',
    description: 'Soirée conviviale dédiée aux jeux de société. Plus de 150 jeux à découvrir, ambiance chaleureuse, snacks et boissons.',
    pricing: 400,
    location: {
      address: '5 Rue de l\'Olmet',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3510, lng: 2.5760 },
    },
    categories: ['SOIREEJEUX', 'JEUX', 'SOIREE'],
    media: [
      { url: 'https://picsum.photos/400?random=6', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Exposition d\'Art Local au Musée Fenaille',
    date: '2025-09-05T10:00:00Z',
    description: 'Exposition mêlant peintures, sculptures et photographies d\'artistes locaux aveyronnais. Découvrez les talents émergents de la région.',
    pricing: 1000,
    location: {
      address: '19 Place Galy, Musée Fenaille',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3615, lng: 2.5720 },
    },
    website: 'https://musee-fenaille.fr',
    categories: ['EXPOSITION', 'ART', 'MUSEE'],
    media: [
      { url: 'https://picsum.photos/400?random=7', type: 'image/jpeg' },
      { url: 'https://picsum.photos/400?random=8', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Yoga et Méditation en Plein Air',
    date: '2025-07-25T06:30:00Z',
    description: 'Séance de yoga vinyasa et méditation au lever du soleil avec vue sur la Cathédrale. Tous niveaux bienvenus, tapis fournis.',
    pricing: 0,
    location: {
      address: 'Jardins de la Patte d\'Oie',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3540, lng: 2.5680 },
    },
    categories: ['YOGA', 'BIENETRE', 'NATURE'],
    media: [
      { url: 'https://picsum.photos/400?random=9', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Tournoi E-Sport Counter-Strike 2',
    date: '2025-08-18T14:00:00Z',
    description: 'Tournoi amateur CS2 en 5v5. Prize pool de 800€. Inscription par équipe, PC haute performance fournis sur place, ambiance compétitive.',
    pricing: 1200,
    location: {
      address: '45 Avenue Tarayre',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3480, lng: 2.5650 },
    },
    categories: ['ESPORT', 'TOURNOIJEUXVIDEO', 'JEUXVIDEO'],
    media: [
      { url: 'https://picsum.photos/400?random=10', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Marché Nocturne d\'Été',
    date: '2025-07-30T19:00:00Z',
    description: 'Grand marché nocturne du Rodez estival avec producteurs locaux, artisans, food trucks régionaux. Animations de rue et spectacles.',
    pricing: 0,
    location: {
      address: 'Place de la Cité',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3530, lng: 2.5740 },
    },
    categories: ['MARCHE', 'FETELOCALE', 'SOIREE'],
    media: [
      { url: 'https://picsum.photos/400?random=11', type: 'image/jpeg' },
    ],
  },
  {
    name: 'Visite Guidée des Trésors Architecturaux',
    date: '2025-06-20T10:00:00Z',
    description: 'Visite guidée thématique dans le Rodez médiéval. Découvrez l\'histoire de la Cathédrale, des hôtels particuliers et des secrets architecturaux.',
    pricing: 800,
    location: {
      address: 'Place d\'Armes, Devant la Cathédrale',
      city: 'Rodez',
      postalCode: '12000',
      country: 'France',
      coordinates: { lat: 44.3543, lng: 2.5747 },
    },
    categories: ['VISITE', 'PATRIMOINE', 'DECOUVERTE'],
    media: [
      { url: 'https://picsum.photos/400?random=12', type: 'image/jpeg' },
    ],
  },
];

// ============================================
// FONCTIONS
// ============================================
async function login() {
  console.log(`\n📝 Connexion avec ${EMAIL}...\n`);

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      BEARER_TOKEN = data.access_token;
      console.log('[✓] Connexion réussie !\n');
      return true;
    } else {
      console.error(`[✗] Erreur de connexion: ${data.message || 'Erreur inconnue'}\n`);
      return false;
    }
  } catch (err) {
    console.error(`[✗] Erreur réseau: ${err.message}\n`);
    return false;
  }
}

async function createEvents() {
  if (!BEARER_TOKEN) {
    console.error('[✗] Pas de token! Connexion échouée.\n');
    return;
  }

  console.log(`\n🎉 Création de ${events.length} événements pour la company ${COMPANY_ID}...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const event of events) {
    const body = { ...event, companyId: COMPANY_ID };

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`[✓] ${event.name}`);
        successCount++;
      } else {
        console.error(`[✗] ${event.name} — ${res.status}: ${data.message || JSON.stringify(data)}`);
        errorCount++;
      }
    } catch (err) {
      console.error(`[✗] ${event.name} — ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Résumé: ${successCount} réussi(s), ${errorCount} erreur(s)\n`);
}

// ============================================
// EXECUTION
// ============================================
async function main() {
  const connected = await login();
  if (connected) {
    await createEvents();
  }
}

main();
