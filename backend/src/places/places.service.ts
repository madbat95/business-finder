import { Injectable } from '@nestjs/common';
import { BUSINESS_TYPE_TAG_KEYS, CATEGORY_TAGS } from '@business-finder/shared';
import type { PlacesResponse } from '@business-finder/shared';
import { TtlCacheService } from '../common/cache/ttl-cache.service';
import { haversineDistanceKm } from '../common/utils/distance.util';
import { buildOverpassQuery } from '../common/utils/overpass-query.builder';
import { PlaceResultDto } from './dto/place-result.dto';
import { PlacesRequestDto } from './dto/places-request.dto';
import { OverpassClientService, OverpassElement } from './overpass-client.service';

const PLACES_CACHE_TTL_SECONDS = Number(
  process.env.PLACES_CACHE_TTL_SECONDS ?? 300,
);

@Injectable()
export class PlacesService {
  constructor(
    private readonly cache: TtlCacheService,
    private readonly overpassClient: OverpassClientService,
  ) {}

  async findPlaces(request: PlacesRequestDto): Promise<PlacesResponse> {
    const { lat, lon, radiusKm, categories } = request;

    const sortedCategories = [...categories].sort();
    const cacheKey = `places:${lat.toFixed(4)}:${lon.toFixed(4)}:${radiusKm}:${sortedCategories.join(',')}`;

    const cached = this.cache.get<PlacesResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const overpassQl = buildOverpassQuery(lat, lon, radiusKm, categories);
    const overpassResponse = await this.overpassClient.query(overpassQl);

    const results = this.normalizeElements(
      overpassResponse.elements ?? [],
      categories,
      lat,
      lon,
    );

    const response: PlacesResponse = {
      center: { lat, lon },
      radiusKm,
      results,
      count: results.length,
    };

    this.cache.set(cacheKey, response, PLACES_CACHE_TTL_SECONDS);

    return response;
  }

  private normalizeElements(
    elements: OverpassElement[],
    categories: string[],
    centerLat: number,
    centerLon: number,
  ): PlaceResultDto[] {
    const seen = new Set<string>();
    const results: PlaceResultDto[] = [];

    for (const el of elements) {
      const dedupeKey = `${el.type}/${el.id}`;
      if (seen.has(dedupeKey)) continue;

      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (elLat === undefined || elLon === undefined) continue;

      seen.add(dedupeKey);

      const tags = el.tags ?? {};
      const name = tags.name ?? tags.operator ?? 'Unnamed location';
      const category = this.matchCategory(tags, categories);
      const address = this.buildAddress(tags);
      const phone = tags.phone ?? tags['contact:phone'] ?? null;
      const website = tags.website ?? tags['contact:website'] ?? null;
      const email = tags.email ?? tags['contact:email'] ?? null;
      const businessType = this.pickBusinessType(tags);

      const distanceKm = haversineDistanceKm(
        centerLat,
        centerLon,
        elLat,
        elLon,
      );

      const result: PlaceResultDto = {
        id: dedupeKey,
        name,
        category,
        distanceKm,
        lat: elLat,
        lon: elLon,
        address,
        phone,
        website,
        email,
        businessType,
      };

      results.push(result);
    }

    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return results;
  }

  private matchCategory(
    tags: Record<string, string>,
    categories: string[],
  ): string {
    for (const category of categories) {
      const tagPairs = CATEGORY_TAGS[category] ?? [];
      for (const [k, v] of tagPairs) {
        if (tags[k] === v) {
          return category;
        }
      }
    }
    return categories[0] ?? 'general';
  }

  private pickBusinessType(tags: Record<string, string>): string | null {
    for (const key of BUSINESS_TYPE_TAG_KEYS) {
      if (tags[key]) {
        return tags[key];
      }
    }
    return null;
  }

  private buildAddress(tags: Record<string, string>): string | null {
    if (tags['addr:full']) {
      return tags['addr:full'];
    }

    const parts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'],
    ].filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(' ') : null;
  }
}
