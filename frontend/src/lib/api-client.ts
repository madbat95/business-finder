export interface ApiErrorBody {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  body: ApiErrorBody;
  status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || body.error || 'Request failed');
    this.status = status;
    this.body = body;
  }
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  label: string;
}

export interface PlaceResult {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  lat: number;
  lon: number;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  businessType: string | null;
}

export interface PlacesResponse {
  center: { lat: number; lon: number };
  radiusKm: number;
  results: PlaceResult[];
  count: number;
  unmatchedCustomCategories: string[];
}

export interface PlacesRequest {
  lat: number;
  lon: number;
  radiusKm: number;
  categories: string[];
  customCategories?: string[];
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody> {
  try {
    const data = await res.json();
    if (data && typeof data === 'object' && 'message' in data) {
      return data as ApiErrorBody;
    }
    return { error: 'unknown_error', message: `Request failed with status ${res.status}` };
  } catch {
    return { error: 'unknown_error', message: `Request failed with status ${res.status}` };
  }
}

export async function geocode(query: string): Promise<GeocodeResult> {
  const res = await fetch(`/api/backend/geocode?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorBody(res));
  }

  return res.json();
}

export async function searchPlaces(req: PlacesRequest): Promise<PlacesResponse> {
  const res = await fetch('/api/backend/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorBody(res));
  }

  return res.json();
}
