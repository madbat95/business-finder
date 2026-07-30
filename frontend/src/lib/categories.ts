export const CATEGORY_LABELS: Record<string, string> = {
  electric: 'Electric utility',
  water: 'Water / wastewater',
  gas: 'Gas utility',
  general: 'Utility office',
  electrician: 'Electrician',
  plumber: 'Plumber',
  hvac: 'HVAC contractor',
  waste: 'Waste management',
};

export const DEFAULT_CATEGORIES = ['electric', 'water', 'gas', 'general'];

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);
