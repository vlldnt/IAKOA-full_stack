// Charge la configuration d'environnement de test (.env.test, non versionné).
// Copiez .env.test.example vers .env.test pour exécuter les tests localement.
require('dotenv').config({ path: '.env.test' });
