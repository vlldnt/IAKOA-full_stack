import type { EventType } from '@/lib/types/EventType';

// État interne du formulaire (saisies brutes, converties au submit)
export interface EventFormData {
  companyId: string;
  name: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isFree: boolean;
  priceEuros: string; // saisie libre "12,50"
  website: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  lat?: number;
  lng?: number;
  categories: string[];
  mediaUrls: string[];
}

export const EMPTY_FORM: EventFormData = {
  companyId: '',
  name: '',
  description: '',
  date: '',
  time: '20:00',
  isFree: true,
  priceEuros: '',
  website: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  categories: [],
  mediaUrls: [],
};

export const MAX_CATEGORIES = 5;

// Pré-remplit le formulaire depuis un événement existant (mode édition)
export function formFromEvent(event: EventType): EventFormData {
  const dateObj = new Date(event.date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    companyId: event.companyId,
    name: event.name,
    description: event.description ?? '',
    date: `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`,
    time: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
    isFree: event.pricing === 0,
    priceEuros: event.pricing > 0 ? String(event.pricing / 100).replace('.', ',') : '',
    website: event.website ?? '',
    address: event.location?.address ?? '',
    city: event.location?.city ?? '',
    postalCode: event.location?.postalCode ?? '',
    country: event.location?.country ?? 'France',
    lat: event.location?.coordinates?.lat,
    lng: event.location?.coordinates?.lng,
    categories: event.categories ?? [],
    mediaUrls: (event.media ?? []).map(m => m.url),
  };
}

// Prix saisi ("12,50") → centimes entiers
export function parsePriceCents(form: EventFormData): number {
  if (form.isFree) return 0;
  const parsed = Number.parseFloat(form.priceEuros.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
}

// Type MIME déduit de l'extension d'une URL d'image
function guessMediaType(url: string): string {
  const extension = url.split('?')[0].split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  return types[extension ?? ''] ?? 'image/jpeg';
}

// Construit le corps attendu par POST /events et PATCH /events/:id
export function toEventPayload(form: EventFormData): Omit<EventType, 'id'> {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    date: new Date(`${form.date}T${form.time}`).toISOString(),
    pricing: parsePriceCents(form),
    companyId: form.companyId,
    website: form.website.trim() || undefined,
    location: {
      address: form.address.trim() || undefined,
      city: form.city,
      postalCode: form.postalCode || undefined,
      country: form.country || 'France',
      coordinates: { lat: form.lat!, lng: form.lng! },
    },
    categories: form.categories,
    media: form.mediaUrls.map(url => ({ url, type: guessMediaType(url) })),
  };
}

// Validation par étape ; retourne le message d'erreur ou null
export function validateStep(step: number, form: EventFormData): string | null {
  switch (step) {
    case 0:
      return form.companyId ? null : 'Sélectionnez ou créez une entreprise organisatrice.';
    case 1: {
      if (!form.name.trim()) return "Le nom de l'événement est obligatoire.";
      if (form.name.trim().length > 100) return 'Le nom ne peut pas dépasser 100 caractères.';
      if (!form.description.trim()) return 'La description est obligatoire.';
      if (form.description.trim().length > 5000)
        return 'La description ne peut pas dépasser 5000 caractères.';
      if (!form.date || !form.time) return "La date et l'heure sont obligatoires.";
      if (new Date(`${form.date}T${form.time}`).getTime() <= Date.now())
        return "La date de l'événement doit être dans le futur.";
      if (!form.isFree) {
        const cents = parsePriceCents(form);
        if (cents <= 0) return 'Indiquez un prix valide ou cochez « Gratuit ».';
      }
      if (form.website.trim() && !/^https?:\/\/\S+\.\S+/.test(form.website.trim()))
        return 'Le site web doit être une URL valide (https://…).';
      return null;
    }
    case 2:
      if (!form.city) return 'Sélectionnez une ville dans les suggestions.';
      if (form.lat == null || form.lng == null)
        return 'Les coordonnées GPS sont manquantes : sélectionnez la ville dans la liste.';
      return null;
    case 3:
      return form.categories.length > 0
        ? null
        : 'Choisissez au moins une catégorie pour que votre événement soit trouvable.';
    default:
      return null;
  }
}
