import { Injectable, Logger } from '@nestjs/common';
import type { GeocodeResult } from '@business-finder/shared';
import { TtlCacheService } from '../common/cache/ttl-cache.service';
import {
  GeocodeNotFoundError,
  UpstreamError,
  UpstreamRateLimitedError,
  UpstreamTimeoutError,
} from '../common/errors/api-errors';

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL ?? 'https://nominatim.openstreetmap.org';
const NOMINATIM_USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? 'NearbyBusinessFinder/1.0';
const GEOCODE_CACHE_TTL_SECONDS = Number(
  process.env.GEOCODE_CACHE_TTL_SECONDS ?? 3600,
);
const REQUEST_TIMEOUT_MS = 9000;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  constructor(private readonly cache: TtlCacheService) {}

  async geocode(query: string): Promise<GeocodeResult> {
    const trimmed = query.trim();
    const cacheKey = `geocode:${trimmed.toLowerCase()}`;

    const cached = this.cache.get<GeocodeResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const url = `${NOMINATIM_BASE_URL}/search?format=json&limit=1&q=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': NOMINATIM_USER_AGENT,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new UpstreamTimeoutError('Nominatim request timed out.');
      }
      this.logger.error(`Nominatim request failed: ${err?.message ?? err}`);
      throw new UpstreamError('Failed to reach Nominatim.');
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429) {
      throw new UpstreamRateLimitedError('Nominatim rate-limited the request.');
    }

    if (!response.ok) {
      throw new UpstreamError(
        `Nominatim responded with status ${response.status}.`,
      );
    }

    let data: NominatimResult[];
    try {
      data = (await response.json()) as NominatimResult[];
    } catch (err) {
      throw new UpstreamError('Failed to parse Nominatim response.');
    }

    if (!Array.isArray(data) || data.length === 0) {
      throw new GeocodeNotFoundError(
        `No results found for query "${trimmed}".`,
      );
    }

    const first = data[0];
    const result: GeocodeResult = {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      label: first.display_name,
    };

    this.cache.set(cacheKey, result, GEOCODE_CACHE_TTL_SECONDS);

    return result;
  }
}
