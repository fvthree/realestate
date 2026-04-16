// Simplified Philippine locations data
// For production, consider using PSGC API or comprehensive dataset

export const propertyTypes = [
  { value: 'HOUSE', label: 'House' },
  { value: 'CONDO', label: 'Condominium' },
  { value: 'TOWNHOUSE', label: 'Townhouse' },
  { value: 'LOT', label: 'Lot' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'COMMERCIAL', label: 'Commercial' }
];

export const regions = [
  { code: 'NCR', name: 'National Capital Region (NCR)' },
  { code: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
  { code: 'I', name: 'Ilocos Region (Region I)' },
  { code: 'II', name: 'Cagayan Valley (Region II)' },
  { code: 'III', name: 'Central Luzon (Region III)' },
  { code: 'IV-A', name: 'CALABARZON (Region IV-A)' },
  { code: 'IV-B', name: 'MIMAROPA (Region IV-B)' },
  { code: 'V', name: 'Bicol Region (Region V)' },
  { code: 'VI', name: 'Western Visayas (Region VI)' },
  { code: 'VII', name: 'Central Visayas (Region VII)' },
  { code: 'VIII', name: 'Eastern Visayas (Region VIII)' },
  { code: 'IX', name: 'Zamboanga Peninsula (Region IX)' },
  { code: 'X', name: 'Northern Mindanao (Region X)' },
  { code: 'XI', name: 'Davao Region (Region XI)' },
  { code: 'XII', name: 'SOCCSKSARGEN (Region XII)' },
  { code: 'XIII', name: 'Caraga (Region XIII)' },
  { code: 'BARMM', name: 'Bangsamoro (BARMM)' }
];

export const provincesByRegion: { [key: string]: Array<{ code: string; name: string }> } = {
  'NCR': [
    { code: 'MNL', name: 'Manila' },
    { code: 'QC', name: 'Quezon City' },
    { code: 'MAK', name: 'Makati' },
    { code: 'TAW', name: 'Taguig' },
    { code: 'PAS', name: 'Pasig' },
    { code: 'MAN', name: 'Mandaluyong' },
    { code: 'MAR', name: 'Marikina' },
    { code: 'PAR', name: 'Parañaque' },
    { code: 'LAS', name: 'Las Piñas' },
    { code: 'MUN', name: 'Muntinlupa' },
    { code: 'CAL', name: 'Caloocan' },
    { code: 'MAL', name: 'Malabon' },
    { code: 'NAV', name: 'Navotas' },
    { code: 'VAL', name: 'Valenzuela' },
    { code: 'SJM', name: 'San Juan' },
    { code: 'PAT', name: 'Pateros' }
  ],
  'III': [
    { code: 'AUR', name: 'Aurora' },
    { code: 'BAT', name: 'Bataan' },
    { code: 'BUL', name: 'Bulacan' },
    { code: 'NUE', name: 'Nueva Ecija' },
    { code: 'PAM', name: 'Pampanga' },
    { code: 'TAR', name: 'Tarlac' },
    { code: 'ZAM', name: 'Zambales' }
  ],
  'IV-A': [
    { code: 'BAT', name: 'Batangas' },
    { code: 'CAV', name: 'Cavite' },
    { code: 'LAG', name: 'Laguna' },
    { code: 'QUE', name: 'Quezon' },
    { code: 'RIZ', name: 'Rizal' }
  ],
  'VII': [
    { code: 'BOH', name: 'Bohol' },
    { code: 'CEB', name: 'Cebu' },
    { code: 'NEG', name: 'Negros Oriental' },
    { code: 'SIQ', name: 'Siquijor' }
  ]
  // Add more provinces for other regions as needed
};

export const citiesByProvince: { [key: string]: Array<{ code: string; name: string }> } = {
  'MNL': [
    { code: 'MNL-CITY', name: 'Manila City' }
  ],
  'QC': [
    { code: 'QC-CITY', name: 'Quezon City' }
  ],
  'MAK': [
    { code: 'MAK-CITY', name: 'Makati City' }
  ],
  'CEB': [
    { code: 'CEB-CITY', name: 'Cebu City' },
    { code: 'MAN-CITY', name: 'Mandaue City' },
    { code: 'LAP-CITY', name: 'Lapu-Lapu City' },
    { code: 'TOL', name: 'Toledo' },
    { code: 'CAR', name: 'Carcar' },
    { code: 'DAN', name: 'Danao' }
  ],
  'LAG': [
    { code: 'CAL', name: 'Calamba' },
    { code: 'STA-ROSA', name: 'Santa Rosa' },
    { code: 'BIN', name: 'Biñan' },
    { code: 'SAN-PABLO', name: 'San Pablo' },
    { code: 'CAB', name: 'Cabuyao' }
  ],
  'CAV': [
    { code: 'DASH', name: 'Dasmariñas' },
    { code: 'IMUS', name: 'Imus' },
    { code: 'BACOOR', name: 'Bacoor' },
    { code: 'CAVITE-CITY', name: 'Cavite City' },
    { code: 'TAGAYTAY', name: 'Tagaytay' }
  ]
  // Add more cities for other provinces as needed
};

// Sample barangays (you would have comprehensive data in production)
export const barangaysByCity: { [key: string]: Array<{ code: string; name: string }> } = {
  'CEB-CITY': [
    { code: 'APAS', name: 'Apas' },
    { code: 'BANILAD', name: 'Banilad' },
    { code: 'BUSAY', name: 'Busay' },
    { code: 'LAHUG', name: 'Lahug' },
    { code: 'MABOLO', name: 'Mabolo' },
    { code: 'TALAMBAN', name: 'Talamban' },
    { code: 'CAPITOL-SITE', name: 'Capitol Site' }
  ],
  'MAK-CITY': [
    { code: 'BEL-AIR', name: 'Bel-Air' },
    { code: 'FORBES-PARK', name: 'Forbes Park' },
    { code: 'DASMARINAS', name: 'Dasmariñas' },
    { code: 'SAN-LORENZO', name: 'San Lorenzo' },
    { code: 'POBLACION', name: 'Poblacion' }
  ]
  // Add more barangays for other cities as needed
};

