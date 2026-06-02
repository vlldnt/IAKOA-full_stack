import * as tokenService from './tokenService';

/**
 * URL de base de l'API, configurable via la variable d'environnement Vite.
 * Valeur de repli sur l'instance locale de développement.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Erreur applicative normalisée renvoyée par le client API.
 *
 * Description : encapsule le code HTTP et le message métier renvoyé par le
 * backend afin que toute la couche appel API expose un format d'erreur unique.
 * Pourquoi : éviter que chaque service ré-invente son propre parsing d'erreur
 * et permettre aux composants/hooks de réagir au `status` (401, 403, 409...).
 */
export class ApiError extends Error {
  /** Code HTTP de la réponse en échec. */
  readonly status: number;
  /** Corps d'erreur brut renvoyé par le backend, si disponible. */
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Options d'une requête API, surensemble restreint de `RequestInit`.
 */
export interface IRequestOptions extends Omit<RequestInit, 'body'> {
  /** Corps de requête : objet (sérialisé en JSON) ou `FormData` (multipart). */
  body?: unknown;
  /** Désactive l'ajout automatique du header `Authorization`. */
  skipAuth?: boolean;
  /** Désactive la tentative de rafraîchissement automatique sur 401. */
  skipRefresh?: boolean;
}

/**
 * Promesse de rafraîchissement en cours (single-flight).
 *
 * Pourquoi : si plusieurs requêtes échouent simultanément en 401, on ne déclenche
 * qu'un seul appel `/auth/refresh` et toutes les requêtes attendent son résultat.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Tente de renouveler les tokens via le refresh token.
 *
 * Paramètres : aucun (lit le refresh token depuis le stockage local).
 * Retour : `true` si les tokens ont été renouvelés, `false` sinon.
 * Cas d'utilisation : appelé automatiquement par `request` lorsqu'une réponse
 * authentifiée renvoie 401.
 * Pourquoi : centraliser la logique de refresh et garantir un seul appel
 * concurrent grâce au verrou `refreshPromise`.
 */
async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!res.ok) {
        tokenService.clearTokens();
        return false;
      }

      // Le backend renvoie les tokens en snake_case (access_token/refresh_token).
      const data = (await res.json()) as {
        access_token?: string;
        refresh_token?: string;
      };
      if (!data.access_token || !data.refresh_token) {
        tokenService.clearTokens();
        return false;
      }

      tokenService.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      tokenService.clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Construit les en-têtes HTTP d'une requête (JSON + Authorization).
 *
 * Paramètres :
 * - `options` : options de la requête courante.
 * Retour : objet `Headers` prêt à l'emploi.
 * Pourquoi : factoriser la gestion du `Content-Type` (absent pour `FormData`,
 * géré automatiquement par le navigateur) et du token d'accès.
 */
function buildHeaders(options: IRequestOptions): Headers {
  const headers = new Headers(options.headers);

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const token = tokenService.getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

/**
 * Sérialise le corps de requête selon son type.
 *
 * Paramètres :
 * - `body` : corps fourni par l'appelant (objet, `FormData` ou indéfini).
 * Retour : `BodyInit` accepté par `fetch`, ou `undefined`.
 * Pourquoi : éviter de sérialiser un `FormData` (upload de fichiers) tout en
 * convertissant automatiquement les objets en JSON.
 */
function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData) return body;
  return JSON.stringify(body);
}

/**
 * Exécute une requête HTTP centralisée vers l'API.
 *
 * Description : point d'entrée unique de tous les appels réseau du frontend.
 * Gère l'URL de base, l'authentification, la sérialisation JSON, le parsing de
 * la réponse, le rafraîchissement automatique du token sur 401 (avec rejeu) et
 * la normalisation des erreurs via `ApiError`.
 *
 * Paramètres :
 * - `path` : chemin relatif de la ressource (ex. `/events?page=1`).
 * - `options` : méthode, corps, en-têtes et options d'authentification.
 *
 * Retour : la réponse JSON typée `T` (ou `undefined` typé pour un corps vide,
 * ex. réponses 204).
 *
 * Cas d'utilisation : utilisé par tous les services métier (events, companies,
 * favorites, account...) à la place d'appels `fetch` dispersés.
 *
 * Pourquoi : supprimer la duplication (token, headers, gestion d'erreur) et
 * fournir un comportement réseau cohérent et sécurisé dans toute l'application.
 *
 * @throws {ApiError} si la réponse HTTP est en échec.
 */
export async function request<T>(path: string, options: IRequestOptions = {}): Promise<T> {
  const { body, skipAuth, skipRefresh, ...init } = options;

  const execute = (): Promise<Response> =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
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

  // Réponses sans corps (204 No Content) : on renvoie `undefined`.
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Raccourcis HTTP au-dessus de `request`, pour une lecture plus concise dans
 * les services (`api.get`, `api.post`, ...).
 */
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
