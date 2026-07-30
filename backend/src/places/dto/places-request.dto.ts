import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { CATEGORY_TAGS } from '@business-finder/shared';

const KNOWN_CATEGORIES = Object.keys(CATEGORY_TAGS);

export class PlacesRequestDto {
  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lon!: number;

  @IsNumber()
  @Transform(({ value }) => {
    // Silently clamp to [1, 100] km rather than rejecting out-of-range values.
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) return num;
    return Math.min(100, Math.max(1, num));
  })
  radiusKm!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsIn(KNOWN_CATEGORIES, { each: true })
  categories!: string[];
}
