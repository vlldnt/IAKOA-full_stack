import { apiFetch } from '@/lib/api-client';
import type { SocialNetworks } from '@/lib/types/EventType';

export interface CompanyType {
  id: string;
  name: string;
  siren: string;
  description?: string | null;
  website?: string | null;
  socialNetworks?: SocialNetworks | null;
  isValidated: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  siren: string;
  description?: string;
  website?: string;
  socialNetworks?: SocialNetworks;
}

// Entreprises de l'utilisateur connecté
export async function fetchMyCompanies(): Promise<CompanyType[]> {
  return apiFetch<CompanyType[]>('/companies/my-companies');
}

// Crée une entreprise (réservé aux organisateurs)
export async function createCompany(payload: CreateCompanyPayload): Promise<CompanyType> {
  return apiFetch<CompanyType>('/companies', { method: 'POST', body: payload });
}
