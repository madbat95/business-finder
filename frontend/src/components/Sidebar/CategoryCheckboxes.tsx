'use client';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

interface CategoryCheckboxesProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryCheckboxes({ selected, onChange }: CategoryCheckboxesProps) {
  function toggle(category: string) {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  }

  return (
    <div className="field-group">
      <span className="field-label">Categories</span>
      <div className="category-grid">
        {ALL_CATEGORIES.map((category) => (
          <label key={category} className="category-item">
            <input
              type="checkbox"
              checked={selected.includes(category)}
              onChange={() => toggle(category)}
            />
            {CATEGORY_LABELS[category]}
          </label>
        ))}
      </div>
    </div>
  );
}
