'use client';

import { Locate, MapPin, Search } from 'lucide-react';

interface LocationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onLocate: () => void;
  locating: boolean;
  pinMode: boolean;
  onTogglePin: () => void;
}

export default function LocationField({ value, onChange, onLocate, locating, pinMode, onTogglePin }: LocationFieldProps) {
  return (
    <div className="pill-row">
      <Search size={16} className="pill-icon" aria-hidden="true" />
      <input
        id="location-input"
        className="pill-input"
        type="text"
        placeholder="City, address, or place"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className={`pill-icon-btn${pinMode ? ' active' : ''}`}
        onClick={onTogglePin}
        title="Pin a point on the map"
        aria-label="Pin a point on the map"
        aria-pressed={pinMode}
      >
        <MapPin size={16} />
      </button>
      <button
        type="button"
        className="pill-icon-btn"
        onClick={onLocate}
        disabled={locating}
        title="Use my location"
        aria-label="Use my location"
      >
        <Locate size={16} />
      </button>
    </div>
  );
}
