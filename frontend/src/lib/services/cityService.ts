// Service de recherche de communes françaises via l'API publique geo.api.gouv.fr
// (autocomplétion de ville dans la barre de recherche et le menu de filtres).

// Résultat de recherche d'une commune.
export interface ICityResult {
  name: string;
  region: string;
  lat: number;
  lon: number;
  postcode?: string;
}

// Forme brute d'une commune renvoyée par l'API geo.api.gouv.fr.
interface IGeoApiCommune {
  nom: string;
  codesPostaux?: string[];
  centre?: { coordinates?: [number, number] };
  departement?: { nom?: string };
}

// Nombre minimal de caractères avant de déclencher une recherche.
const MIN_QUERY_LENGTH = 2;

// Recherche des communes françaises par nom (jusqu'à 5 résultats, vide si erreur).
export async function searchCities(query: string): Promise<ICityResult[]> {
  if (query.trim().length < MIN_QUERY_LENGTH) return [];

  const params = new URLSearchParams({
    nom: query,
    fields: 'nom,code,codesPostaux,centre,departement',
    boost: 'population',
    limit: '5',
  });

  try {
    const response = await fetch(`https://geo.api.gouv.fr/communes?${params}`);
    if (!response.ok) return [];

    const data = (await response.json()) as IGeoApiCommune[];
    return data.map((commune) => ({
      name: commune.nom,
      region: commune.departement?.nom ?? '',
      lat: commune.centre?.coordinates?.[1] ?? 0,
      lon: commune.centre?.coordinates?.[0] ?? 0,
      postcode: commune.codesPostaux?.[0],
    }));
  } catch {
    return [];
  }
}
