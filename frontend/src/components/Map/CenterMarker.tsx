'use client';

import { Circle, Marker } from 'react-leaflet';
import L from 'leaflet';

interface CenterMarkerProps {
  lat: number;
  lon: number;
  radiusKm: number;
}

const centerIcon = L.divIcon({
  className: '',
  html: '<div class="marker-diamond center"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function CenterMarker({ lat, lon, radiusKm }: CenterMarkerProps) {
  return (
    <>
      <Marker position={[lat, lon]} icon={centerIcon} />
      <Circle
        center={[lat, lon]}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#4da3ff', fillColor: '#4da3ff', fillOpacity: 0.12, weight: 1.5 }}
      />
    </>
  );
}
