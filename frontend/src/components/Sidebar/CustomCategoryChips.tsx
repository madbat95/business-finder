'use client';

import { useState, type KeyboardEvent } from 'react';
import { Check, X } from 'lucide-react';
import { isRecognizedCustomCategory } from '@/lib/custom-categories';

interface CustomCategoryChipsProps {
  chips: string[];
  onChange: (chips: string[]) => void;
}

export default function CustomCategoryChips({ chips, onChange }: CustomCategoryChipsProps) {
  const [draft, setDraft] = useState('');

  function addChip() {
    const term = draft.trim();
    if (!term) return;
    if (!chips.some((c) => c.toLowerCase() === term.toLowerCase())) {
      onChange([...chips, term]);
    }
    setDraft('');
  }

  function removeChip(term: string) {
    onChange(chips.filter((c) => c !== term));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addChip();
    } else if (e.key === 'Backspace' && draft === '' && chips.length > 0) {
      onChange(chips.slice(0, -1));
    }
  }

  return (
    <div className="chip-input">
      {chips.map((term) => {
        const recognized = isRecognizedCustomCategory(term);
        return (
          <span key={term} className={`chip${recognized ? ' recognized' : ' unrecognized'}`}>
            {recognized ? <Check size={12} /> : null}
            {term}
            <button
              type="button"
              className="chip-remove"
              onClick={() => removeChip(term)}
              aria-label={`Remove ${term}`}
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
      <input
        type="text"
        className="chip-draft-input"
        placeholder={chips.length === 0 ? 'Type and press Enter…' : ''}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addChip}
      />
    </div>
  );
}
