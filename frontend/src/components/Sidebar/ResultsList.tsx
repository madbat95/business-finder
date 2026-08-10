'use client';

import { CATEGORY_LABELS } from '@/lib/categories';
import type { PlaceResult } from '@/lib/api-client';

interface ResultsListProps {
  results: PlaceResult[];
  hasSearched: boolean;
  onSelect: (id: string) => void;
}

export default function ResultsList({ results, hasSearched, onSelect }: ResultsListProps) {
  if (!hasSearched) {
    return (
      <div className="results-empty">
        Set a location and radius, then click "Search this area" to see nearby businesses here.
      </div>
    );
  }

  if (results.length === 0) {
    return <div className="results-empty">No results in this radius. Try a larger radius or different categories.</div>;
  }

  return (
    <div className="results-list">
      {results.map((result) => (
        <div
          key={result.id}
          className="result-card"
          onClick={() => onSelect(result.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelect(result.id);
          }}
        >
          <div className="result-card-top">
            <p className="result-name">{result.name}</p>
            <span className="result-distance">{result.distanceKm.toFixed(1)} km</span>
          </div>
          <p className="result-category">{CATEGORY_LABELS[result.category] ?? result.category}</p>
          {result.address && <p className="result-address">{result.address}</p>}
        </div>
      ))}
    </div>
  );
}
