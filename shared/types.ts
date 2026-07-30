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

export interface PlacesRequest {
  lat: number;
  lon: number;
  radiusKm: number;
  categories: string[];
}

export interface PlacesResponse {
  center: { lat: number; lon: number };
  radiusKm: number;
  results: PlaceResult[];
  count: number;
}

export interface ApiErrorBody {
  error: string;
  message: string;
  details?: object;
}
