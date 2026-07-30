import { useCallback, useState } from 'react';
import { geocode, ApiError, type GeocodeResult } from '@/lib/api-client';
import { parseCoords } from '@/lib/coord-parse.util';

interface UseGeocodeResult {
  resolving: boolean;
  error: string | null;
  resolveLocation: (input: string) => Promise<GeocodeResult | null>;
}

/**
 * Resolves a location input string to coordinates.
 * If the input is already a literal "lat, lon" pair, skips the geocode
 * call entirely and resolves it locally.
 */
export function useGeocode(): UseGeocodeResult {
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveLocation = useCallback(async (input: string): Promise<GeocodeResult | null> => {
    setError(null);

    const literalCoords = parseCoords(input);
    if (literalCoords) {
      return { lat: literalCoords.lat, lon: literalCoords.lon, label: input.trim() };
    }

    setResolving(true);
    try {
      const result = await geocode(input);
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.message);
      } else {
        setError('Failed to resolve location.');
      }
      return null;
    } finally {
      setResolving(false);
    }
  }, []);

  return { resolving, error, resolveLocation };
}
