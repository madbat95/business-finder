import { CATEGORY_LABELS } from '@business-finder/shared';
import { PlaceResultDto } from '../../places/dto/place-result.dto';

const CSV_COLUMNS = [
  'name',
  'category',
  'businessType',
  'address',
  'phone',
  'email',
  'website',
  'distanceKm',
  'lat',
  'lon',
] as const;

export function escapeCsvField(value: string | number | null): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function placesToCsv(results: PlaceResultDto[]): string {
  const rows = [CSV_COLUMNS.join(',')];

  for (const result of results) {
    const row = [
      result.name,
      CATEGORY_LABELS[result.category] ?? result.category,
      result.businessType,
      result.address,
      result.phone,
      result.email,
      result.website,
      result.distanceKm,
      result.lat,
      result.lon,
    ].map(escapeCsvField);
    rows.push(row.join(','));
  }

  return rows.join('\r\n') + '\r\n';
}
