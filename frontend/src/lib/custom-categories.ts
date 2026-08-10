// Mirrors shared/custom-categories.ts's term list (frontend intentionally
// doesn't import from shared/, per this codebase's existing convention --
// same as lib/categories.ts duplicating CATEGORY_LABELS). This is used only
// for immediate "recognized/unrecognized" chip feedback as the user types;
// the backend's copy remains the actual source of truth for what a search
// matches -- every typed term (recognized or not) is still sent to the
// backend, which re-validates independently.
export const RECOGNIZED_CUSTOM_CATEGORIES = new Set([
  'bakery',
  'restaurant',
  'cafe',
  'coffee',
  'pharmacy',
  'hardware store',
  'hardware',
  'grocery',
  'supermarket',
  'convenience',
  'hairdresser',
  'hair salon',
  'barber',
  'gym',
  'fitness',
  'dentist',
  'doctor',
  'clinic',
  'mechanic',
  'auto repair',
  'bar',
  'pub',
  'hotel',
  'bookstore',
  'books',
  'clothing store',
  'clothes',
  'bank',
  'laundry',
  'dry cleaner',
  'florist',
  'flowers',
  'pet store',
  'pet shop',
  'jeweler',
  'jewelry',
  'optician',
  'furniture',
  'electronics',
  'butcher',
  'bicycle',
  'library',
  'veterinary',
  'vet',
]);

export function isRecognizedCustomCategory(term: string): boolean {
  return RECOGNIZED_CUSTOM_CATEGORIES.has(term.trim().toLowerCase());
}
