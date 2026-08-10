'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import LocationField from '@/components/Sidebar/LocationField';
import RadiusSlider from '@/components/Sidebar/RadiusSlider';
import CategoryPills from '@/components/Sidebar/CategoryPills';
import CustomCategoryChips from '@/components/Sidebar/CustomCategoryChips';
import StatusBar, { type StatusKind } from '@/components/Sidebar/StatusBar';
import ResultsList from '@/components/Sidebar/ResultsList';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
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

export default function SearchPage() {
  const [locationInput, setLocationInput] = useState(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [customCategoryChips, setCustomCategoryChips] = useState<string[]>([]);
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchToken, setSearchToken] = useState(0);
  const [locating, setLocating] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(true);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<LastSearchParams | null>(null);
  const [status, setStatus] = useState<Status | null>(null);

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

  const handleToggleControls = useCallback(() => {
    setControlsExpanded((expanded) => !expanded);
  }, []);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setCenter({ lat, lon });
    setLocationInput(`${lat}, ${lon}`);
    setPinMode(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setCategories([]);
    setRadiusKm(DEFAULT_RADIUS);
    setCustomCategoryChips([]);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!locationInput.trim()) {
      setStatus({ message: 'Please enter a location.', kind: 'error' });
      return;
    }
    if (categories.length === 0 && customCategoryChips.length === 0) {
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

    const placesResult = await search(nextCenter.lat, nextCenter.lon, radiusKm, categories, customCategoryChips);
    if (!placesResult) {
      setStatus({ message: 'Something went wrong while searching. Please try again.', kind: 'error' });
      return;
    }

    setResults(placesResult.results);
    setHasSearched(true);
    setSearchToken((t) => t + 1);
    setResultsOpen(true);
    setLastSearchParams({
      lat: nextCenter.lat,
      lon: nextCenter.lon,
      radiusKm,
      categories,
      customCategories: customCategoryChips,
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
  }, [locationInput, categories, customCategoryChips, radiusKm, resolveLocation, search]);

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

      <div className="top-controls">
        <div className="search-pill">
          <LocationField
            value={locationInput}
            onChange={setLocationInput}
            onLocate={handleLocate}
            locating={locating}
            pinMode={pinMode}
            onTogglePin={handleTogglePin}
            controlsExpanded={controlsExpanded}
            onToggleControls={handleToggleControls}
          />
          {controlsExpanded && (
            <>
              <div className="pill-divider" />
              <RadiusSlider value={radiusKm} onChange={setRadiusKm} />
            </>
          )}
        </div>

        {status && (
          <div className="floating-status">
            <StatusBar message={status.message} kind={status.kind} />
          </div>
        )}

        {controlsExpanded && (
          <div className="filter-row">
            <CategoryPills selected={categories} onChange={setCategories} />
            <CustomCategoryChips chips={customCategoryChips} onChange={setCustomCategoryChips} />
            <button type="button" className="reset-filters-link" onClick={handleResetFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>

      <button type="button" className="search-btn" onClick={handleSearch} disabled={busy}>
        {busy && <Loader2 size={14} className="spin" />}
        {busy ? 'Searching…' : 'Search this area'}
      </button>

      {hasSearched && (
        <button type="button" className="results-count" onClick={() => setResultsOpen(true)}>
          {results.length} result{results.length === 1 ? '' : 's'}
        </button>
      )}

      {/* Desktop: persistent side rail (unaffected by the mobile drawer below). */}
      <aside className="results-rail">
        <div className="results-rail-header">
          <span className="results-rail-title">Results</span>
          {exportUrl && (
            <a className="export-link" href={exportUrl} download>
              <Download size={13} />
              Export CSV
            </a>
          )}
        </div>
        <div className="results-rail-body">
          <ResultsList results={results} hasSearched={hasSearched} onSelect={select} />
        </div>
      </aside>

      {/* Mobile: a real bottom-sheet drawer (shadcn/Base UI) instead of a
          hand-rolled always-peeking panel -- opens on demand via the
          results-count badge or automatically once a search completes. */}
      <Drawer open={resultsOpen} onOpenChange={setResultsOpen} showSwipeHandle>
        <DrawerContent className="results-drawer-content">
          <DrawerHeader className="results-drawer-header">
            <DrawerTitle className="results-rail-title">Results</DrawerTitle>
            {exportUrl && (
              <a className="export-link" href={exportUrl} download>
                <Download size={13} />
                Export CSV
              </a>
            )}
          </DrawerHeader>
          <div className="results-rail-body">
            <ResultsList results={results} hasSearched={hasSearched} onSelect={select} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
