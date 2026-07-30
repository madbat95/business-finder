import { useCallback, useState } from 'react';
import { searchPlaces, ApiError, type PlacesResponse } from '@/lib/api-client';

interface UsePlacesSearchResult {
  searching: boolean;
  error: string | null;
  search: (lat: number, lon: number, radiusKm: number, categories: string[]) => Promise<PlacesResponse | null>;
}

export function usePlacesSearch(): UsePlacesSearchResult {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (lat: number, lon: number, radiusKm: number, categories: string[]): Promise<PlacesResponse | null> => {
      setError(null);
      setSearching(true);
      try {
        const result = await searchPlaces({ lat, lon, radiusKm, categories });
        return result;
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.body.message);
        } else {
          setError('Failed to search this area.');
        }
        return null;
      } finally {
        setSearching(false);
      }
    },
    []
  );

  return { searching, error, search };
}
