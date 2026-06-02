/**
 * Service de recherche de communes françaises.
 *
 * Utilise l'API publique geo.api.gouv.fr (Découpage administratif).
 * Contrairement au géocodage d'adresses, cette API ne renvoie que des communes
 * (nom, code postal, centre géographique), ce qui convient à l'autocomplétion
 * de ville dans la barre de recherche et le menu de filtres.
 */

/** Résultat de recherche d'une commune. */
export interface ICityResult {
  name: string;
  region: string;
  lat: number;
  lon: number;
  postcode?: string;
}

/** Forme brute d'une commune renvoyée par l'API geo.api.gouv.fr. */
interface IGeoApiCommune {
  nom: string;
  codesPostaux?: string[];
  centre?: { coordinates?: [number, number] };
  departement?: { nom?: string };
}

/** Nombre minimal de caractères avant de déclencher une recherche. */
const MIN_QUERY_LENGTH = 2;

/**
 * Recherche des communes françaises par nom.
 *
 * Paramètres : `query` — texte saisi par l'utilisateur.
 * Retour : jusqu'à 5 communes correspondantes (vide si requête trop courte ou
 * en cas d'erreur réseau).
 * Cas d'utilisation : autocomplétion de ville dans `SearchBar` et `FilterMenu`.
 * Pourquoi : centraliser l'appel à l'API externe pour supprimer la duplication
 * et sortir la logique réseau des composants.
 */
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
