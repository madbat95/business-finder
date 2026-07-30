import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';
import { CATEGORY_TAGS } from '@shared/categories';

const KNOWN_CATEGORIES = Object.keys(CATEGORY_TAGS);

export class PlacesExportQueryDto {
  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  lat!: number;

  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').map((v) => v.trim()) : value,
  )
  categories!: string[];
}
