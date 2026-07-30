import type { PlaceResult } from '@shared/types';

export class PlaceResultDto implements PlaceResult {
  id!: string;
  name!: string;
  category!: string;
  distanceKm!: number;
  lat!: number;
  lon!: number;
  address!: string | null;
  phone!: string | null;
  website!: string | null;
  email!: string | null;
  businessType!: string | null;
}
