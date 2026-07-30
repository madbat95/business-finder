export interface ParsedCoords {
  lat: number;
  lon: number;
}

const COORD_PATTERN = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;

/**
 * Detects whether a location input string is a literal "lat, lon" pair.
 * Returns the parsed coordinates if so, otherwise null (meaning the string
 * should be sent to the geocoder as a place name / address).
 */
export function parseCoords(input: string): ParsedCoords | null {
  const trimmed = input.trim();
  const match = COORD_PATTERN.exec(trimmed);
  if (!match) return null;

  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);

  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}
