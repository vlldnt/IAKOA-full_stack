-- AlterTable: make password nullable (OAuth users have no password)
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable: add OAuth fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "providerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_provider_providerId_key" ON "users"("provider", "providerId");
