import { Injectable, Logger } from '@nestjs/common';
import {
  UpstreamError,
  UpstreamRateLimitedError,
  UpstreamTimeoutError,
} from '../common/errors/api-errors';

const OVERPASS_BASE_URL =
  process.env.OVERPASS_BASE_URL ?? 'https://overpass-api.de/api/interpreter';
const REQUEST_TIMEOUT_MS = 29000;

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassElement[];
}

@Injectable()
export class OverpassClientService {
  private readonly logger = new Logger(OverpassClientService.name);

  async query(overpassQl: string): Promise<OverpassResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(OVERPASS_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          // Overpass's Apache front-end does content negotiation and returns
          // 406 for some HTTP clients (including Node's default fetch) that
          // omit an explicit Accept header.
          Accept: '*/*',
          'User-Agent': process.env.NOMINATIM_USER_AGENT ?? 'NearbyBusinessFinder/1.0',
        },
        body: overpassQl,
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw new UpstreamTimeoutError('Overpass request timed out.');
      }
      this.logger.error(`Overpass request failed: ${err?.message ?? err}`);
      throw new UpstreamError('Failed to reach Overpass API.');
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429 || response.status === 504) {
      throw new UpstreamRateLimitedError(
        `Overpass responded with status ${response.status}.`,
      );
    }

    if (!response.ok) {
      throw new UpstreamError(
        `Overpass responded with status ${response.status}.`,
      );
    }

    try {
      return (await response.json()) as OverpassResponse;
    } catch (err) {
      throw new UpstreamError('Failed to parse Overpass response.');
    }
  }
}
