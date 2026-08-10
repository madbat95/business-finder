'use client';

import { MapContainer, TileLayer, useMap, useMapEvent } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import CenterMarker from './CenterMarker';
import ResultMarkers from './ResultMarkers';
import MapLegend from './MapLegend';
import type { PlaceResult } from '@/lib/api-client';
import type { SelectedResult } from '@/hooks/useSelectedResult';

const HOUSTON: [number, number] = [29.7604, -95.3698];
const DEFAULT_ZOOM = 10;

interface MapViewProps {
  center: { lat: number; lon: number } | null;
  radiusKm: number;
  results: PlaceResult[];
  selected: SelectedResult | null;
  searchToken: number;
  pinMode: boolean;
  onMapClick: (lat: number, lon: number) => void;
}

interface MapEffectsProps {
  center: { lat: number; lon: number } | null;
  radiusKm: number;
  results: PlaceResult[];
  selected: SelectedResult | null;
  searchToken: number;
  pinMode: boolean;
  onMapClick: (lat: number, lon: number) => void;
}

function MapEffects({ center, radiusKm, results, selected, searchToken, pinMode, onMapClick }: MapEffectsProps) {
  const map = useMap();
  const lastSearchToken = useRef<number>(0);

  // Only listens while pinMode is armed -- clicking to place a new search
  // center is opt-in so normal map panning/zooming isn't disrupted.
  useMapEvent('click', (e) => {
    if (!pinMode) return;
    onMapClick(e.latlng.lat, e.latlng.lng);
  });

  // Fit bounds to the search circle whenever a new search completes.
  useEffect(() => {
    if (!center) return;
    if (searchToken === lastSearchToken.current) return;
    lastSearchToken.current = searchToken;

    const bounds = L.latLng(center.lat, center.lon).toBounds(radiusKm * 1000 * 2);
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [center, radiusKm, searchToken, map]);

  // Pan/zoom to the selected result and let ResultMarkers open its popup.
  useEffect(() => {
    if (!selected) return;
    const result = results.find((r) => r.id === selected.id);
    if (!result) return;
    map.setView([result.lat, result.lon], Math.max(map.getZoom(), 15), { animate: true });
  }, [selected, results, map]);

  return null;
}

export default function MapView({ center, radiusKm, results, selected, searchToken, pinMode, onMapClick }: MapViewProps) {
  const initialCenter: [number, number] = center ? [center.lat, center.lon] : HOUSTON;

  return (
    <>
      <MapContainer
        center={initialCenter}
        zoom={DEFAULT_ZOOM}
        className={`leaflet-container${pinMode ? ' pin-mode' : ''}`}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && <CenterMarker lat={center.lat} lon={center.lon} radiusKm={radiusKm} />}
        <ResultMarkers results={results} selected={selected} />
        <MapEffects
          center={center}
          radiusKm={radiusKm}
          results={results}
          selected={selected}
          searchToken={searchToken}
          pinMode={pinMode}
          onMapClick={onMapClick}
        />
      </MapContainer>
      <MapLegend />
    </>
  );
}
