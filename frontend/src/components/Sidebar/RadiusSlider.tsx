'use client';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="radius-input">
        Search radius
      </label>
      <div className="radius-row">
        <input
          id="radius-input"
          className="radius-slider"
          type="range"
          min={1}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="radius-value">{value} km</span>
      </div>
    </div>
  );
}
