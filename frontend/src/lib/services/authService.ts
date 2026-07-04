const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Service d'authentification - gère tous les appels API.
// L'authentification repose sur des cookies HttpOnly posés par le serveur :
// aucun token n'est stocké côté client, chaque appel envoie les cookies
// via credentials: 'include'.

// Connecte un utilisateur avec email et mot de passe
export async function loginAPI(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return { response: res, data };
}

// Crée un nouveau compte utilisateur
export async function registerAPI(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  return { response: res, data };
}

// Déconnecte l'utilisateur (révoque la session et supprime les cookies)
export async function logoutAPI() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // La déconnexion locale reste effective même si l'appel réseau échoue
  }
}

// Renouvelle les tokens via le cookie refresh (rotation côté serveur)
// Retourne true si le renouvellement a réussi
export async function refreshTokensAPI(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Récupère les informations de l'utilisateur connecté
export async function getUserAPI() {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}
