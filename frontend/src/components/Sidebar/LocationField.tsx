'use client';

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
    <div className="field-group">
      <label className="field-label" htmlFor="location-input">
        Location
      </label>
      <div className="location-row">
        <input
          id="location-input"
          className="text-input"
          type="text"
          placeholder="City, address, or place"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className={`locate-btn${pinMode ? ' active' : ''}`}
          onClick={onTogglePin}
          title="Click a point on the map to set the search center"
          aria-label="Click a point on the map to set the search center"
          aria-pressed={pinMode}
        >
          📍
        </button>
        <button
          type="button"
          className="locate-btn"
          onClick={onLocate}
          disabled={locating}
          title="Use my current location"
          aria-label="Use my current location"
        >
          {locating ? '…' : '⌖'}
        </button>
      </div>
      {pinMode && <p className="pin-mode-hint">Click anywhere on the map to set the search center.</p>}
    </div>
  );
}
