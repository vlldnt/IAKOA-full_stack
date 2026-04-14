import * as tokenService from './tokenService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface CompanyType {
  id: string;
  name: string;
  siren: string;
  isValidated: boolean;
  website?: string;
  description?: string;
  ownerId: string;
}

export interface SocialNetworks {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}

export interface CreateCompanyPayload {
  name: string;
  siren: string;
  description?: string;
  website?: string;
  socialNetworks?: SocialNetworks;
}

// Récupère les entreprises de l'utilisateur connecté
export async function fetchMyCompanies(): Promise<CompanyType[]> {
  const token = tokenService.getAccessToken();
  if (!token) throw new Error('Non authentifié');

  const res = await fetch(`${API_BASE_URL}/companies/my-companies`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération des entreprises : ${res.statusText}`);
  }

  return await res.json();
}

// Crée une nouvelle entreprise (isCreator requis)
export async function createCompany(payload: CreateCompanyPayload): Promise<CompanyType> {
  const token = tokenService.getAccessToken();
  if (!token) throw new Error('Non authentifié');

  // Nettoyer les réseaux sociaux vides avant envoi
  const socialNetworks = payload.socialNetworks
    ? Object.fromEntries(
        Object.entries(payload.socialNetworks).filter(([, v]) => v && v.trim() !== '')
      )
    : undefined;

  const body = {
    ...payload,
    socialNetworks: socialNetworks && Object.keys(socialNetworks).length > 0
      ? socialNetworks
      : undefined,
  };

  const res = await fetch(`${API_BASE_URL}/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Erreur lors de la création de l'entreprise : ${res.statusText}`);
  }

  return await res.json();
}
