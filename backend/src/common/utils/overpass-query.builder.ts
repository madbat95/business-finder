import { CATEGORY_TAGS } from '@business-finder/shared';

/**
 * Builds an Overpass QL query for the given categories around a point.
 * For each category, for each [key, value] tag pair, emits a node and way
 * query within the given radius, then wraps everything into a single
 * out:json request with center coordinates and tags. customTagPairs are
 * tag pairs already resolved from free-text custom category terms --
 * appended the same way as preset category tag pairs.
 */
export function buildOverpassQuery(
  lat: number,
  lon: number,
  radiusKm: number,
  categories: string[],
  customTagPairs: [string, string][] = [],
): string {
  const radiusM = Math.round(radiusKm * 1000);
  const clauses: string[] = [];

  const allTagPairs: [string, string][] = [
    ...categories.flatMap((category) => CATEGORY_TAGS[category] ?? []),
    ...customTagPairs,
  ];

  for (const [k, v] of allTagPairs) {
    clauses.push(`node["${k}"="${v}"](around:${radiusM},${lat},${lon});`);
    clauses.push(`way["${k}"="${v}"](around:${radiusM},${lat},${lon});`);
  }

  return `[out:json][timeout:25];(${clauses.join('')});out center tags;`;
}
