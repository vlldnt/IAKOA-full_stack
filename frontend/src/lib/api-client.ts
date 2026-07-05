// Client HTTP central de l'application.
//
// - Base URL unique (VITE_API_URL)
// - credentials: 'include' systématique (auth par cookies HttpOnly)
// - Erreurs typées (ApiError avec status + message serveur)
// - Sur 401 : une tentative de refresh (rotation côté serveur) puis retry
//   unique de la requête — un seul refresh à la fois, partagé entre les
//   appels concurrents.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Désactive le refresh automatique sur 401 (endpoints d'auth eux-mêmes) */
  skipAuthRetry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

// Un seul refresh simultané : les 401 concurrents attendent le même résultat
function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await rawRequest(path, options);

  // Access token expiré : tenter un refresh puis rejouer la requête une fois
  if (res.status === 401 && !options.skipAuthRetry) {
    const refreshed = await refreshSession();
    if (refreshed) {
      res = await rawRequest(path, options);
    }
  }

  if (!res.ok) {
    const data: unknown = await res.json().catch(() => ({}));
    const serverMessage =
      typeof data === 'object' && data !== null && 'message' in data
        ? String((data as { message: unknown }).message)
        : undefined;
    throw new ApiError(res.status, serverMessage || `Erreur ${res.status}`);
  }

  // 204 ou corps vide
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
