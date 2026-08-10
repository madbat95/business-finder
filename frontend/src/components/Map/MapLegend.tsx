'use client';

export default function MapLegend() {
  return (
    <div className="map-legend">
      <div className="map-legend-row">
        <span className="marker-diamond center" aria-hidden="true" />
        Search center
      </div>
      <div className="map-legend-row">
        <span className="marker-dot result" aria-hidden="true" />
        Result
      </div>
    </div>
  );
}
