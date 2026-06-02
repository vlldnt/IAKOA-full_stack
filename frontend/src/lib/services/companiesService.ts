import { api } from './apiClient';

// Représentation d'une entreprise côté front.
export interface CompanyType {
  id: string;
  name: string;
  siren: string;
  isValidated: boolean;
  website?: string;
  description?: string;
  ownerId: string;
}

// Réseaux sociaux optionnels associés à une entreprise.
export interface SocialNetworks {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}

// Données nécessaires à la création d'une entreprise.
export interface CreateCompanyPayload {
  name: string;
  siren: string;
  description?: string;
  website?: string;
  socialNetworks?: SocialNetworks;
}

// Retire les réseaux sociaux vides du payload (ne garde que les renseignés).
function cleanSocialNetworks(socialNetworks?: SocialNetworks): SocialNetworks | undefined {
  if (!socialNetworks) return undefined;
  const filled = Object.fromEntries(
    Object.entries(socialNetworks).filter(([, value]) => value && value.trim() !== ''),
  );
  return Object.keys(filled).length > 0 ? filled : undefined;
}

// Récupère les entreprises de l'utilisateur connecté.
export function fetchMyCompanies(): Promise<CompanyType[]> {
  return api.get<CompanyType[]>('/companies/my-companies');
}

// Crée une nouvelle entreprise (nécessite le statut créateur).
export function createCompany(payload: CreateCompanyPayload): Promise<CompanyType> {
  return api.post<CompanyType>('/companies', {
    ...payload,
    socialNetworks: cleanSocialNetworks(payload.socialNetworks),
  });
}

// Met à jour une entreprise (propriétaire uniquement).
export function updateCompany(
  id: string,
  payload: Partial<CreateCompanyPayload>,
): Promise<CompanyType> {
  return api.patch<CompanyType>(`/companies/${id}`, {
    ...payload,
    socialNetworks: cleanSocialNetworks(payload.socialNetworks),
  });
}

// Supprime une entreprise (propriétaire uniquement).
export function deleteCompany(id: string): Promise<void> {
  return api.delete<void>(`/companies/${id}`);
}
