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
    return null;
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
          <p className="result-name">{result.name}</p>
          <span className="result-tag">
            {CATEGORY_LABELS[result.category] ?? result.category} · {result.distanceKm.toFixed(1)} km
          </span>
          {result.businessType && <p className="result-detail">{result.businessType}</p>}
          {result.address && <p className="result-detail">{result.address}</p>}
          {result.phone && <p className="result-detail">{result.phone}</p>}
          {result.email && (
            <p className="result-detail">
              <a href={`mailto:${result.email}`} onClick={(e) => e.stopPropagation()}>
                {result.email}
              </a>
            </p>
          )}
          {result.website && (
            <p className="result-detail">
              <a href={result.website} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {result.website}
              </a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
