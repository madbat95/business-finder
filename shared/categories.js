"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_LABELS = exports.CATEGORY_TAGS = void 0;
exports.CATEGORY_TAGS = {
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
exports.CATEGORY_LABELS = {
    electric: 'Electric utility',
    water: 'Water / wastewater',
    gas: 'Gas utility',
    general: 'Utility office',
    electrician: 'Electrician',
    plumber: 'Plumber',
    hvac: 'HVAC contractor',
    waste: 'Waste management',
};
//# sourceMappingURL=categories.js.map