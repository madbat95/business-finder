'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { PlaceResult } from '@/lib/api-client';
import { CATEGORY_LABELS } from '@/lib/categories';
import type { SelectedResult } from '@/hooks/useSelectedResult';

interface ResultMarkersProps {
  results: PlaceResult[];
  selected: SelectedResult | null;
}

const resultIcon = L.divIcon({
  className: '',
  html: '<div class="marker-dot result"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function ResultMarkers({ results, selected }: ResultMarkersProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!selected) return;
    const marker = markerRefs.current.get(selected.id);
    if (marker) {
      marker.openPopup();
    }
  }, [selected]);

  return (
    <>
      {results.map((result) => (
        <Marker
          key={result.id}
          position={[result.lat, result.lon]}
          icon={resultIcon}
          ref={(instance) => {
            if (instance) markerRefs.current.set(result.id, instance);
            else markerRefs.current.delete(result.id);
          }}
        >
          <Popup>
            <p className="popup-title">{result.name}</p>
            <p className="popup-detail">
              {CATEGORY_LABELS[result.category] ?? result.category} · {result.distanceKm.toFixed(1)} km
            </p>
            {result.address && <p className="popup-detail">{result.address}</p>}
          </Popup>
        </Marker>
      ))}
    </>
  );
}
