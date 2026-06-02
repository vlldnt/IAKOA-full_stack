/**
 * Seed de développement IAKOA.
 *
 * Peuple la base LOCALE avec un utilisateur créateur, une entreprise et des
 * événements géolocalisés, afin d'avoir des données à afficher en dev.
 *
 * Idempotent : ré-exécutable sans créer de doublons (upsert user/entreprise,
 * et événements créés seulement si l'entreprise n'en a pas encore).
 *
 * Lancement : `npm run seed` (dans le dossier backend).
 */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Même configuration que PrismaService (Prisma 7 utilise un driver adapter).
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'iakoa_dev',
  password: process.env.PGPASSWORD || 'Awlmpzw12',
  database: process.env.PGDATABASE || 'iakoa-backend',
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const CREATOR = {
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  password: 'Password123!',
};

const COMPANY = {
  name: 'IAKOA Events',
  siren: '123456789',
};

/** Quelques villes françaises avec coordonnées pour la carte. */
const CITIES = [
  { city: 'Paris', postalCode: '75001', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon', postalCode: '69001', lat: 45.764, lng: 4.8357 },
  { city: 'Marseille', postalCode: '13001', lat: 43.2965, lng: 5.3698 },
  { city: 'Bordeaux', postalCode: '33000', lat: 44.8378, lng: -0.5792 },
  { city: 'Lille', postalCode: '59000', lat: 50.6292, lng: 3.0573 },
  { city: 'Nantes', postalCode: '44000', lat: 47.2184, lng: -1.5536 },
];

const SAMPLE_EVENTS = [
  { name: 'Concert de Jazz au Sunset', categories: ['CONCERT', 'SOIREE'], pricing: 1500 },
  { name: 'Exposition Art Contemporain', categories: ['ART', 'EXPOSITION'], pricing: 0 },
  { name: 'Festival Électro en plein air', categories: ['FESTIVAL', 'SOIREE'], pricing: 3500 },
  { name: 'Atelier cuisine italienne', categories: ['COURSDECUISINE', 'DEGUSTATION'], pricing: 4500 },
  { name: 'Tournoi e-sport', categories: ['ESPORT', 'TOURNOIJEUXVIDEO'], pricing: 1000 },
  { name: 'Randonnée nature guidée', categories: ['RANDONNEE', 'NATURE'], pricing: 0 },
  { name: 'Spectacle de danse contemporaine', categories: ['DANSE', 'SPECTACLE'], pricing: 2000 },
  { name: 'Conférence Tech & IA', categories: ['CONFERENCE', 'TECHNOLOGIE'], pricing: 0 },
  { name: 'Marché de créateurs', categories: ['MARCHE', 'MODE'], pricing: 0 },
  { name: 'Soirée jeux de société', categories: ['SOIREEJEUX', 'JEUX'], pricing: 500 },
  { name: 'Festival gastronomique', categories: ['FESTIVAL', 'DEGUSTATION'], pricing: 1200 },
  { name: 'Atelier yoga & méditation', categories: ['YOGA', 'BIENETRE'], pricing: 1800 },
];

/** Retourne une date aléatoire dans les 4 prochains mois. */
function randomFutureDate() {
  const now = Date.now();
  const horizon = 4 * 30 * 24 * 60 * 60 * 1000;
  return new Date(now + Math.random() * horizon);
}

async function main() {
  // 1. Utilisateur créateur (upsert par email).
  const hashedPassword = await bcrypt.hash(CREATOR.password, 10);
  const user = await prisma.user.upsert({
    where: { email: CREATOR.email },
    update: { isCreator: true },
    create: {
      name: CREATOR.name,
      email: CREATOR.email,
      password: hashedPassword,
      isCreator: true,
    },
  });
  console.log(`✅ Utilisateur créateur : ${user.email}`);

  // 2. Entreprise (upsert par SIREN).
  const company = await prisma.company.upsert({
    where: { siren: COMPANY.siren },
    update: {},
    create: {
      name: COMPANY.name,
      siren: COMPANY.siren,
      isValidated: true,
      ownerId: user.id,
    },
  });
  console.log(`✅ Entreprise : ${company.name}`);

  // 3. Événements (seulement si l'entreprise n'en a pas déjà).
  const existing = await prisma.event.count({ where: { companyId: company.id } });
  if (existing > 0) {
    console.log(`ℹ️  ${existing} événement(s) déjà présent(s), création ignorée.`);
    return;
  }

  for (let i = 0; i < SAMPLE_EVENTS.length; i++) {
    const event = SAMPLE_EVENTS[i];
    const place = CITIES[i % CITIES.length];
    await prisma.event.create({
      data: {
        name: event.name,
        date: randomFutureDate(),
        description: `${event.name} — un événement à ne pas manquer à ${place.city}.`,
        pricing: event.pricing,
        categories: event.categories,
        companyId: company.id,
        location: {
          address: `Centre-ville, ${place.city}`,
          city: place.city,
          postalCode: place.postalCode,
          country: 'France',
          coordinates: { lat: place.lat, lng: place.lng },
        },
      },
    });
  }
  console.log(`✅ ${SAMPLE_EVENTS.length} événements créés.`);
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
