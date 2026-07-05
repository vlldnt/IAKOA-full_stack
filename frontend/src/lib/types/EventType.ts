export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  coordinates: Coordinates;
}

export interface Media {
  url: string;
  type: string;
}

export interface SocialNetworks {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  tiktok?: string;
}

// Statut de modération (cycle de vie d'un événement côté back-office)
export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'CANCELLED';

export interface EventType {
  id?: string;
  name: string;
  date: string;
  description: string;
  pricing: number;
  location: Location;
  companyId: string;
  company?: {
    name: string;
    ownerId: string;
    website?: string;
    socialNetworks?: SocialNetworks;
  };
  website?: string | null;
  categories: string[];
  media: Media[];
  status?: EventStatus;
  moderationNote?: string | null;
}
