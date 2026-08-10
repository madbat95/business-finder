'use client';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  return (
    <div className="pill-radius">
      <div className="pill-radius-row">
        <span className="pill-radius-label">Radius</span>
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
      <div className="pill-radius-scale">
        <span>1 km</span>
        <span>~15 mi</span>
        <span>100 km</span>
      </div>
    </div>
  );
}
