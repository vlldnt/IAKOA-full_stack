// URL de base de l'API (variable Vite, repli sur l'instance locale).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Erreur API normalisée : encapsule le code HTTP et le message métier du backend.
export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Options d'une requête API (surensemble restreint de RequestInit).
export interface IRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

// Verrou single-flight : un seul appel /auth/refresh concurrent.
let refreshPromise: Promise<boolean> | null = null;

// Renouvelle la session via le cookie de refresh token (true si réussi).
async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Construit les en-têtes HTTP (Content-Type JSON + en-tête anti-CSRF).
function buildHeaders(options: IRequestOptions): Headers {
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // En-tête anti-CSRF : un site tiers ne peut pas le poser sur une requête simple.
  headers.set('X-Requested-With', 'XMLHttpRequest');

  return headers;
}

// Sérialise le corps : JSON pour un objet, brut pour un FormData.
function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

// Requête HTTP centralisée : cookies, JSON, refresh auto sur 401, erreurs ApiError.
export async function request<T>(path: string, options: IRequestOptions = {}): Promise<T> {
  const { body, skipAuth, skipRefresh, ...init } = options;

  const execute = (): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // Toujours envoyer les cookies HttpOnly d'authentification.
      credentials: 'include',
      headers: buildHeaders({ body, skipAuth, ...init }),
      body: serializeBody(body),
    });

  let response = await execute();

  // Rafraîchissement automatique du token puis rejeu unique de la requête.
  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      response = await execute();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}) as Record<string, unknown>);
    const rawMessage = (errorData as { message?: unknown }).message;
    const message = Array.isArray(rawMessage)
      ? String(rawMessage[0])
      : typeof rawMessage === 'string'
        ? rawMessage
        : `Erreur ${response.status} : ${response.statusText}`;
    throw new ApiError(response.status, message, errorData);
  }

  // Réponses sans corps (204 No Content) : on renvoie undefined.
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// Raccourcis HTTP au-dessus de request (api.get, api.post, ...).
export const api = {
  get: <T>(path: string, options?: IRequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: IRequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: IRequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: IRequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: IRequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
