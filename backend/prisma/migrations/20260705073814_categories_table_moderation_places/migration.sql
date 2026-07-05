-- Migration : enum EventCategory → table categories (gérable en back-office),
-- statut de modération des événements, entité Place.
-- Les données existantes sont migrées AVANT la suppression de l'ancienne colonne.

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'CANCELLED');

-- AlterTable : nouveaux champs (l'ancienne colonne categories est conservée pour le backfill)
ALTER TABLE "events" ADD COLUMN "moderationNote" VARCHAR(500),
ADD COLUMN     "placeId" UUID,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'PENDING';

-- Les événements existants restent visibles publiquement
UPDATE "events" SET "status" = 'PUBLISHED';

-- CreateTable
CREATE TABLE "category_groups" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "color" VARCHAR(7),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "groupId" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255),
    "city" VARCHAR(100),
    "postalCode" VARCHAR(20),
    "country" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToEvent" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_groups_slug_key" ON "category_groups"("slug");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_groupId_idx" ON "categories"("groupId");
CREATE INDEX "places_city_idx" ON "places"("city");
CREATE INDEX "_CategoryToEvent_B_index" ON "_CategoryToEvent"("B");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_placeId_idx" ON "events"("placeId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "category_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "events" ADD CONSTRAINT "events_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CategoryToEvent" ADD CONSTRAINT "_CategoryToEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed : groupes de catégories
INSERT INTO "category_groups" ("id", "updatedAt", "slug", "label", "position") VALUES
  (gen_random_uuid(), now(), 'arts_culture', 'Musique, Arts & Culture', 0),
  (gen_random_uuid(), now(), 'sports_wellness', 'Sports & Bien-être', 1),
  (gen_random_uuid(), now(), 'leisure_entertainment', 'Loisirs & Divertissements', 2),
  (gen_random_uuid(), now(), 'gastronomy', 'Gastronomie', 3),
  (gen_random_uuid(), now(), 'learning_discovery', 'Savoir & Découverte', 4),
  (gen_random_uuid(), now(), 'market_commerce', 'Marché & Commerce', 5),
  (gen_random_uuid(), now(), 'social_causes', 'Causes Sociales & Écologie', 6);

-- Seed : les 70 catégories (slugs alignés sur l'ancien enum)
INSERT INTO "categories" ("id", "updatedAt", "slug", "label", "color", "groupId")
SELECT gen_random_uuid(), now(), v.slug, v.label, v.color, g."id"
FROM (VALUES
  ('CONCERT', 'Concert', '#E11D48', 'arts_culture'),
  ('THEATRE', 'Théâtre', '#BE123C', 'arts_culture'),
  ('SPECTACLE', 'Spectacle', '#F43F5E', 'arts_culture'),
  ('DANSE', 'Danse', '#FB7185', 'arts_culture'),
  ('CINEMA', 'Cinéma', '#9F1239', 'arts_culture'),
  ('ART', 'Art', '#FF4D72', 'arts_culture'),
  ('PEINTURE', 'Peinture', '#C8164A', 'arts_culture'),
  ('PHOTOGRAPHIE', 'Photographie', '#D01848', 'arts_culture'),
  ('EXPOSITION', 'Exposition', '#A81040', 'arts_culture'),
  ('MUSEE', 'Musée', '#881337', 'arts_culture'),
  ('LECTURE', 'Lecture', '#F53060', 'arts_culture'),
  ('FANFARE', 'Fanfare', '#E11D48', 'arts_culture'),
  ('COURSDEDANSE', 'Cours de danse', '#FB7185', 'arts_culture'),
  ('LANCEMENTDELIVRE', 'Lancement de livre', '#F53060', 'arts_culture'),
  ('TRAIL', 'Trail', '#F97316', 'sports_wellness'),
  ('SPORT', 'Sport', '#EA580C', 'sports_wellness'),
  ('COMPETITION', 'Compétition', '#C2410C', 'sports_wellness'),
  ('RANDONNEE', 'Randonnée', '#9A3412', 'sports_wellness'),
  ('NAUTISME', 'Nautisme', '#FB923C', 'sports_wellness'),
  ('YOGA', 'Yoga', '#FDBA74', 'sports_wellness'),
  ('MEDITATION', 'Méditation', '#FED7AA', 'sports_wellness'),
  ('BIENETRE', 'Bien-être', '#FF9A50', 'sports_wellness'),
  ('DEVELOPPEMENTPERSONNEL', 'Développement personnel', '#FF7A28', 'sports_wellness'),
  ('NATURE', 'Nature', '#EA580C', 'sports_wellness'),
  ('OUTDOOR', 'Outdoor', '#C2410C', 'sports_wellness'),
  ('NEIGE', 'Neige', '#FB923C', 'sports_wellness'),
  ('AVENTURE', 'Aventure', '#9A3412', 'sports_wellness'),
  ('RENCONTRESPORTIVE', 'Rencontre sportive', '#F97316', 'sports_wellness'),
  ('JEUX', 'Jeux', '#6366F1', 'leisure_entertainment'),
  ('JEUXVIDEO', 'Jeux vidéo', '#4F46E5', 'leisure_entertainment'),
  ('ESPORT', 'E-sport', '#4338CA', 'leisure_entertainment'),
  ('MANGA', 'Manga', '#818CF8', 'leisure_entertainment'),
  ('COSPLAY', 'Cosplay', '#7C3AED', 'leisure_entertainment'),
  ('FESTIVAL', 'Festival', '#8B5CF6', 'leisure_entertainment'),
  ('FETELOCALE', 'Fête locale', '#3730A3', 'leisure_entertainment'),
  ('FERIA', 'Féria', '#312E81', 'leisure_entertainment'),
  ('SOIREE', 'Soirée', '#A5B4FC', 'leisure_entertainment'),
  ('JOURNEE', 'Journée', '#6D70F5', 'leisure_entertainment'),
  ('ENFANTS', 'Enfants', '#818CF8', 'leisure_entertainment'),
  ('SOIREEJEUX', 'Soirée jeux', '#6366F1', 'leisure_entertainment'),
  ('TOURNOIJEUXVIDEO', 'Tournoi jeux vidéo', '#4F46E5', 'leisure_entertainment'),
  ('RENCONTRE', 'Rencontre', '#A5B4FC', 'leisure_entertainment'),
  ('REPAS', 'Repas', '#D97706', 'gastronomy'),
  ('DEJEUNER', 'Déjeuner', '#FBBF24', 'gastronomy'),
  ('COURSDECUISINE', 'Cours de cuisine', '#B45309', 'gastronomy'),
  ('DEGUSTATION', 'Dégustation', '#F59E0B', 'gastronomy'),
  ('BAR', 'Bar', '#92400E', 'gastronomy'),
  ('CONFERENCE', 'Conférence', '#0D9488', 'learning_discovery'),
  ('FORMATION', 'Formation', '#0F766E', 'learning_discovery'),
  ('LANGUES', 'Langues', '#14B8A6', 'learning_discovery'),
  ('SCIENCE', 'Science', '#0891B2', 'learning_discovery'),
  ('DECOUVERTE', 'Découverte', '#2DD4BF', 'learning_discovery'),
  ('PATRIMOINE', 'Patrimoine', '#115E59', 'learning_discovery'),
  ('VISITE', 'Visite', '#134E4A', 'learning_discovery'),
  ('ATELIER', 'Atelier', '#0D7A74', 'learning_discovery'),
  ('SALONPROFESSIONNEL', 'Salon professionnel', '#0F766E', 'learning_discovery'),
  ('TECHNOLOGIE', 'Technologie', '#0891B2', 'learning_discovery'),
  ('BRICOLAGE', 'Bricolage', '#0D7A74', 'learning_discovery'),
  ('MARCHE', 'Marché', '#B45309', 'market_commerce'),
  ('BROCANTE', 'Brocante', '#92400E', 'market_commerce'),
  ('VIDEGRENIER', 'Vide-grenier', '#D97706', 'market_commerce'),
  ('ENCHERES', 'Enchères', '#78350F', 'market_commerce'),
  ('MODE', 'Mode', '#B45309', 'market_commerce'),
  ('ANIMAUX', 'Animaux', '#4ADE80', 'social_causes'),
  ('BENEVOLAT', 'Bénévolat', '#22C55E', 'social_causes'),
  ('ECOLOGIE', 'Écologie', '#16A34A', 'social_causes'),
  ('SOLIDARITE', 'Solidarité', '#15803D', 'social_causes'),
  ('JARDINAGE', 'Jardinage', '#4ADE80', 'social_causes'),
  ('FERME', 'Ferme', '#22C55E', 'social_causes'),
  ('EVENEMENTCARITATIF', 'Événement caritatif', '#15803D', 'social_causes')
) AS v(slug, label, color, groupslug)
JOIN "category_groups" g ON g."slug" = v.groupslug;

-- Backfill : reporter les catégories des événements existants dans la jointure
INSERT INTO "_CategoryToEvent" ("A", "B")
SELECT c."id", e."id"
FROM "events" e
CROSS JOIN LATERAL unnest(e."categories") AS cat
JOIN "categories" c ON c."slug" = cat::text
ON CONFLICT DO NOTHING;

-- Suppression de l'ancienne colonne et de l'enum, une fois les données migrées
ALTER TABLE "events" DROP COLUMN "categories";
DROP TYPE "EventCategory";
