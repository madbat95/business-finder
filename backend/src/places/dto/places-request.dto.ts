import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
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

  // Optional/empty is allowed here -- a search can rely entirely on
  // customCategories instead. PlacesService enforces "at least one of
  // categories/customCategories must be non-empty" since that can't be
  // expressed as a per-field DTO constraint.
  @IsOptional()
  @IsArray()
  @IsIn(KNOWN_CATEGORIES, { each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customCategories?: string[];
}
