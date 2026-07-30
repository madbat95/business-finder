import { CATEGORY_TAGS } from '@shared/categories';

/**
 * Builds an Overpass QL query for the given categories around a point.
 * For each category, for each [key, value] tag pair, emits a node and way
 * query within the given radius, then wraps everything into a single
 * out:json request with center coordinates and tags.
 */
export function buildOverpassQuery(
  lat: number,
  lon: number,
  radiusKm: number,
  categories: string[],
): string {
  const radiusM = Math.round(radiusKm * 1000);
  const clauses: string[] = [];

  for (const category of categories) {
    const tagPairs = CATEGORY_TAGS[category] ?? [];
    for (const [k, v] of tagPairs) {
      clauses.push(`node["${k}"="${v}"](around:${radiusM},${lat},${lon});`);
      clauses.push(`way["${k}"="${v}"](around:${radiusM},${lat},${lon});`);
    }
  }

  return `[out:json][timeout:25];(${clauses.join('')});out center tags;`;
}
