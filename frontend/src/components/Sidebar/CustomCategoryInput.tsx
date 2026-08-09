'use client';

interface CustomCategoryInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomCategoryInput({ value, onChange }: CustomCategoryInputProps) {
  return (
    <div className="field-group">
      <label className="field-label" htmlFor="custom-category-input">
        Custom categories (optional)
      </label>
      <input
        id="custom-category-input"
        className="text-input"
        type="text"
        placeholder="e.g. bakery, cafe, hardware store"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
