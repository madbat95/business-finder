export const CATEGORY_TAGS: Record<string, [string, string][]> = {
  electric: [
    ['office', 'energy_supplier'],
    ['power', 'plant'],
    ['power', 'substation'],
  ],
  water: [
    ['man_made', 'water_works'],
    ['man_made', 'wastewater_plant'],
    ['office', 'water_utility'],
  ],
  gas: [
    ['office', 'gas'],
    ['pipeline', 'substation'],
  ],
  general: [['office', 'utility']],
  electrician: [['craft', 'electrician']],
  plumber: [['craft', 'plumber']],
  hvac: [['craft', 'hvac']],
  waste: [
    ['office', 'company'],
    ['amenity', 'waste_transfer_station'],
    ['man_made', 'wastewater_plant'],
  ],
};

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

export type Category = keyof typeof CATEGORY_TAGS;

// Priority order for picking a descriptive "what does this business do" tag
// straight from OSM, independent of which search category matched.
export const BUSINESS_TYPE_TAG_KEYS = [
  'description',
  'shop',
  'craft',
  'office',
  'amenity',
  'man_made',
];
