'use client';

import { ALL_CATEGORIES, CATEGORY_LABELS } from '@/lib/categories';

interface CategoryPillsProps {
  selected: string[];
  onChange: (categories: string[]) => void;
}

export default function CategoryPills({ selected, onChange }: CategoryPillsProps) {
  function toggle(category: string) {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  }

  return (
    <>
      {ALL_CATEGORIES.map((category) => {
        const isSelected = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            className={`filter-pill${isSelected ? ' selected' : ''}`}
            onClick={() => toggle(category)}
            aria-pressed={isSelected}
          >
            {CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </>
  );
}
