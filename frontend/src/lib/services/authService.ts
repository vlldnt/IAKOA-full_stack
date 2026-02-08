const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Service d'authentification - gère tous les appels API

// Connecte un utilisateur avec email et mot de passe
export async function loginAPI(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { response: res, data: await res.json() };
}

// Crée un nouveau compte utilisateur
export async function registerAPI(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return { response: res, data: await res.json() };
}

// Déconnecte l'utilisateur (invalide le token côté serveur)
export async function logoutAPI(token: string) {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Renouvelle les tokens d'accès avec le refresh token
export async function refreshTokensAPI(refreshToken: string) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!res.ok) return null;

  return await res.json();
}

// Récupère les informations de l'utilisateur connecté
export async function getUserAPI(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  return await res.json();
}
