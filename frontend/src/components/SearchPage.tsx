'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import LocationField from '@/components/Sidebar/LocationField';
import RadiusSlider from '@/components/Sidebar/RadiusSlider';
import CategoryCheckboxes from '@/components/Sidebar/CategoryCheckboxes';
import CustomCategoryInput from '@/components/Sidebar/CustomCategoryInput';
import StatusBar, { type StatusKind } from '@/components/Sidebar/StatusBar';
import ResultsList from '@/components/Sidebar/ResultsList';
import { useGeocode } from '@/hooks/useGeocode';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import { useSelectedResult } from '@/hooks/useSelectedResult';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import type { PlaceResult } from '@/lib/api-client';

const MapView = dynamic(() => import('@/components/Map/MapView'), { ssr: false });

const DEFAULT_LOCATION = 'Houston, Texas';
const DEFAULT_RADIUS = 25;

interface Status {
  message: string;
  kind: StatusKind;
}

interface LastSearchParams {
  lat: number;
  lon: number;
  radiusKm: number;
  categories: string[];
  customCategories: string[];
}

function parseCustomCategories(input: string): string[] {
  return input
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean);
}

export default function SearchPage() {
  const [locationInput, setLocationInput] = useState(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customCategoriesInput, setCustomCategoriesInput] = useState('');
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchToken, setSearchToken] = useState(0);
  const [locating, setLocating] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<LastSearchParams | null>(null);
  const [status, setStatus] = useState<Status>({
    message: 'Enter a location and click Search to find nearby businesses.',
    kind: 'info',
  });

  const { resolving, resolveLocation } = useGeocode();
  const { searching, search } = usePlacesSearch();
  const { selected, select } = useSelectedResult();

  const busy = resolving || searching;

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({ message: 'Geolocation is not supported by this browser.', kind: 'error' });
      return;
    }
    setPinMode(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationInput(`${latitude}, ${longitude}`);
        setLocating(false);
      },
      () => {
        setStatus({ message: 'Unable to retrieve your location.', kind: 'error' });
        setLocating(false);
      }
    );
  }, []);

  const handleTogglePin = useCallback(() => {
    setPinMode((armed) => !armed);
  }, []);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setCenter({ lat, lon });
    setLocationInput(`${lat}, ${lon}`);
    setPinMode(false);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!locationInput.trim()) {
      setStatus({ message: 'Please enter a location.', kind: 'error' });
      return;
    }
    const customCategories = parseCustomCategories(customCategoriesInput);
    if (categories.length === 0 && customCategories.length === 0) {
      setStatus({ message: 'Please select at least one category or enter a custom category.', kind: 'error' });
      return;
    }

    setStatus({ message: 'Resolving location…', kind: 'info' });

    const geocodeResult = await resolveLocation(locationInput);
    if (!geocodeResult) {
      setStatus({ message: 'Could not resolve that location. Try a different search.', kind: 'error' });
      return;
    }

    const nextCenter = { lat: geocodeResult.lat, lon: geocodeResult.lon };
    setCenter(nextCenter);
    setStatus({ message: 'Searching this area…', kind: 'info' });

    const placesResult = await search(nextCenter.lat, nextCenter.lon, radiusKm, categories, customCategories);
    if (!placesResult) {
      setStatus({ message: 'Something went wrong while searching. Please try again.', kind: 'error' });
      return;
    }

    setResults(placesResult.results);
    setHasSearched(true);
    setSearchToken((t) => t + 1);
    setLastSearchParams({
      lat: nextCenter.lat,
      lon: nextCenter.lon,
      radiusKm,
      categories,
      customCategories,
    });

    const unmatchedNote =
      placesResult.unmatchedCustomCategories.length > 0
        ? ` Didn't recognize: ${placesResult.unmatchedCustomCategories.join(', ')}.`
        : '';

    if (placesResult.count === 0) {
      setStatus({
        message: `No results in this radius. Try a larger radius or different categories.${unmatchedNote}`,
        kind: 'info',
      });
    } else {
      setStatus({
        message: `Found ${placesResult.count} result${placesResult.count === 1 ? '' : 's'}.${unmatchedNote}`,
        kind: 'success',
      });
    }
  }, [locationInput, categories, customCategoriesInput, radiusKm, resolveLocation, search]);

  const searchButtonLabel = useMemo(() => (busy ? 'Searching…' : 'Search this area'), [busy]);

  const exportUrl = useMemo(() => {
    if (!lastSearchParams || results.length === 0) return null;
    const params = new URLSearchParams({
      lat: String(lastSearchParams.lat),
      lon: String(lastSearchParams.lon),
      radiusKm: String(lastSearchParams.radiusKm),
    });
    if (lastSearchParams.categories.length > 0) {
      params.set('categories', lastSearchParams.categories.join(','));
    }
    if (lastSearchParams.customCategories.length > 0) {
      params.set('customCategories', lastSearchParams.customCategories.join(','));
    }
    return `/api/backend/places/export?${params.toString()}`;
  }, [lastSearchParams, results.length]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-scroll">
          <div>
            <p className="eyebrow">OpenStreetMap</p>
            <h1 className="app-title">Nearby Business Finder</h1>
            <p className="app-description">
              Search any location worldwide to find nearby businesses and utilities within a set radius.
            </p>
          </div>

          <LocationField
            value={locationInput}
            onChange={setLocationInput}
            onLocate={handleLocate}
            locating={locating}
            pinMode={pinMode}
            onTogglePin={handleTogglePin}
          />

          <RadiusSlider value={radiusKm} onChange={setRadiusKm} />

          <CategoryCheckboxes selected={categories} onChange={setCategories} />

          <CustomCategoryInput value={customCategoriesInput} onChange={setCustomCategoriesInput} />

          <button type="button" className="search-btn" onClick={handleSearch} disabled={busy}>
            {searchButtonLabel}
          </button>

          <StatusBar message={status.message} kind={status.kind} />

          {exportUrl && (
            <a className="export-btn" href={exportUrl} download>
              Export CSV
            </a>
          )}

          <ResultsList results={results} hasSearched={hasSearched} onSelect={select} />
        </div>
      </aside>
      <div className="map-container">
        <MapView
          center={center}
          radiusKm={radiusKm}
          results={results}
          selected={selected}
          searchToken={searchToken}
          pinMode={pinMode}
          onMapClick={handleMapClick}
        />
      </div>
    </div>
  );
}
