import { api } from './apiClient';

/** Représentation d'une entreprise côté front. */
export interface CompanyType {
  id: string;
  name: string;
  siren: string;
  isValidated: boolean;
  website?: string;
  description?: string;
  ownerId: string;
}

/** Réseaux sociaux optionnels associés à une entreprise. */
export interface SocialNetworks {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}

/** Données nécessaires à la création d'une entreprise. */
export interface CreateCompanyPayload {
  name: string;
  siren: string;
  description?: string;
  website?: string;
  socialNetworks?: SocialNetworks;
}

/**
 * Supprime les réseaux sociaux vides d'un payload entreprise.
 *
 * Paramètres : `socialNetworks` — réseaux sociaux saisis (potentiellement vides).
 * Retour : un objet ne contenant que les réseaux renseignés, ou `undefined`.
 * Pourquoi : éviter d'envoyer des champs vides au backend et factoriser le
 * nettoyage utilisé à la création et à la mise à jour.
 */
function cleanSocialNetworks(socialNetworks?: SocialNetworks): SocialNetworks | undefined {
  if (!socialNetworks) return undefined;
  const filled = Object.fromEntries(
    Object.entries(socialNetworks).filter(([, value]) => value && value.trim() !== ''),
  );
  return Object.keys(filled).length > 0 ? filled : undefined;
}

/**
 * Récupère les entreprises de l'utilisateur connecté.
 *
 * Retour : la liste des entreprises possédées par l'utilisateur.
 * Cas d'utilisation : section « Mes entreprises » du profil.
 */
export function fetchMyCompanies(): Promise<CompanyType[]> {
  return api.get<CompanyType[]>('/companies/my-companies');
}

/**
 * Crée une nouvelle entreprise (nécessite le statut créateur).
 *
 * Paramètres : `payload` — données de l'entreprise.
 * Retour : l'entreprise créée.
 * Cas d'utilisation : formulaire de création d'entreprise.
 */
export function createCompany(payload: CreateCompanyPayload): Promise<CompanyType> {
  return api.post<CompanyType>('/companies', {
    ...payload,
    socialNetworks: cleanSocialNetworks(payload.socialNetworks),
  });
}

/**
 * Met à jour une entreprise (propriétaire uniquement).
 *
 * Paramètres : `id` — identifiant ; `payload` — champs à modifier.
 * Retour : l'entreprise mise à jour.
 * Cas d'utilisation : édition d'une entreprise existante.
 */
export function updateCompany(
  id: string,
  payload: Partial<CreateCompanyPayload>,
): Promise<CompanyType> {
  return api.patch<CompanyType>(`/companies/${id}`, {
    ...payload,
    socialNetworks: cleanSocialNetworks(payload.socialNetworks),
  });
}

/**
 * Supprime une entreprise (propriétaire uniquement).
 *
 * Paramètres : `id` — identifiant de l'entreprise.
 * Cas d'utilisation : suppression d'une entreprise par son propriétaire.
 */
export function deleteCompany(id: string): Promise<void> {
  return api.delete<void>(`/companies/${id}`);
}
