import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================
// VARIABLES A MODIFIER AVANT CHAQUE EXECUTION
// ============================================
const EMAIL = 'jean.dupont@example.com';
const PASSWORD = 'Password123!';
const COMPANY_ID = '46f0f344-5251-4bd6-b93e-2ab8ae8469c8';
const API_URL = 'http://localhost:3000';

let BEARER_TOKEN = null;

// ============================================
// CHARGER LES EVENEMENTS DEPUIS LE JSON
// ============================================
const eventsPath = path.join(__dirname, 'events.json');
const eventsData = fs.readFileSync(eventsPath, 'utf-8');
const events = JSON.parse(eventsData);

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
