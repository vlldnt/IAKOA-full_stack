export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  address: string;
  city: string;
  postalCode: string;
  country: string;
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
  website: string;
  categories: string[];
  media: Media[];
}

