import { useState, useCallback } from 'react';

export interface SelectedResult {
  id: string;
  token: number;
}

/**
 * Tracks which result (by id) is currently selected, so the map can pan/zoom
 * to it and open its popup when a result in the list is clicked. The token
 * increments on every selection so re-clicking the same result still
 * re-triggers the map's pan/zoom effect.
 */
export function useSelectedResult() {
  const [selected, setSelected] = useState<SelectedResult | null>(null);

  const select = useCallback((id: string) => {
    setSelected((prev) => ({ id, token: (prev?.token ?? 0) + 1 }));
  }, []);

  const clear = useCallback(() => setSelected(null), []);

  return { selected, select, clear };
}
