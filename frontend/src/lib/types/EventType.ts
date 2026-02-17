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

export interface EventType {
  id?: string;
  name: string;
  date: string;
  description: string;
  pricing: number;
  location: Location;
  companyId: string;
  company?: { name: string; ownerId: string };
  website: string;
  categories: string[];
  media: Media[];
}

export interface EventContextType {
  events: EventType[];
  selectedEvent: EventType | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  fetchEvents: () => Promise<void>;
  fetchEventsPaginated: (page: number, limit: number) => Promise<void>;
  fetchMoreEvents: (page: number, limit: number) => Promise<void>;
  prefetchNextPage: (page: number, limit: number) => Promise<void>;
  fetchFilteredEvents: (page: number, limit: number, filters?: any) => Promise<void>;
  selectEvent: (id: string) => Promise<void>;
  createEvent: (event: Omit<EventType, "id">) => Promise<EventType>;
  updateEvent: (id: string, event: Partial<EventType>) => Promise<EventType>;
  deleteEvent: (id: string) => Promise<void>;
}
