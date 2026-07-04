/**
 * Accès centralisé aux variables d'environnement.
 * Aucun fallback pour les secrets : l'application refuse de démarrer
 * si une variable requise est absente (fail-fast).
 */

const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante: ${name}. ` +
        `Copiez .env.example vers .env et renseignez les valeurs.`,
    );
  }
  return value;
}

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes: ${missing.join(', ')}. ` +
        `Copiez .env.example vers .env et renseignez les valeurs.`,
    );
  }
}
