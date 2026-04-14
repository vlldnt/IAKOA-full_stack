// Service de géocodage : transforme une adresse en coordonnées lat/lng
// Utilise l'API Base Adresse Nationale (BAN) — api-adresse.data.gouv.fr
// Retourne des adresses complètes (numéro + rue + ville) avec coordonnées GPS précises,
// contrairement à geo.api.gouv.fr qui ne couvre que les communes.

export interface AddressSuggestion {
  label: string;       // "12 Rue de la Paix 75001 Paris"
  city: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];

  const params = new URLSearchParams({
    q: query,
    limit: '5',
    autocomplete: '1',
  });

  const res = await fetch(`https://api-adresse.data.gouv.fr/search/?${params}`);
  if (!res.ok) return [];

  const data = await res.json();

  return (data.features ?? []).map((f: any) => ({
    label: f.properties.label,
    city: f.properties.city,
    postalCode: f.properties.postcode,
    country: 'France',
    coordinates: {
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
    },
  }));
}
