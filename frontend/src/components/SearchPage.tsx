'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import LocationField from '@/components/Sidebar/LocationField';
import RadiusSlider from '@/components/Sidebar/RadiusSlider';
import CategoryCheckboxes from '@/components/Sidebar/CategoryCheckboxes';
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

export default function SearchPage() {
  const [locationInput, setLocationInput] = useState(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchToken, setSearchToken] = useState(0);
  const [locating, setLocating] = useState(false);
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

  const handleSearch = useCallback(async () => {
    if (!locationInput.trim()) {
      setStatus({ message: 'Please enter a location.', kind: 'error' });
      return;
    }
    if (categories.length === 0) {
      setStatus({ message: 'Please select at least one category.', kind: 'error' });
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

    const placesResult = await search(nextCenter.lat, nextCenter.lon, radiusKm, categories);
    if (!placesResult) {
      setStatus({ message: 'Something went wrong while searching. Please try again.', kind: 'error' });
      return;
    }

    setResults(placesResult.results);
    setHasSearched(true);
    setSearchToken((t) => t + 1);

    if (placesResult.count === 0) {
      setStatus({ message: 'No results in this radius. Try a larger radius or different categories.', kind: 'info' });
    } else {
      setStatus({ message: `Found ${placesResult.count} result${placesResult.count === 1 ? '' : 's'}.`, kind: 'success' });
    }
  }, [locationInput, categories, radiusKm, resolveLocation, search]);

  const searchButtonLabel = useMemo(() => (busy ? 'Searching…' : 'Search this area'), [busy]);

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
          />

          <RadiusSlider value={radiusKm} onChange={setRadiusKm} />

          <CategoryCheckboxes selected={categories} onChange={setCategories} />

          <button type="button" className="search-btn" onClick={handleSearch} disabled={busy}>
            {searchButtonLabel}
          </button>

          <StatusBar message={status.message} kind={status.kind} />

          <ResultsList results={results} hasSearched={hasSearched} onSelect={select} />
        </div>
      </aside>
      <div className="map-container">
        <MapView center={center} radiusKm={radiusKm} results={results} selected={selected} searchToken={searchToken} />
      </div>
    </div>
  );
}
