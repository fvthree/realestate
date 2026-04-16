// Backend API Address Structure
export interface PropertyAddress {
  region: string;
  province: string;
  city_municipality: string; // Note: matches backend field name
  barangay?: string;
  postal_code?: string; // Note: snake_case to match backend
  street_address?: string; // Note: snake_case to match backend
}

// Backend API Geo Structure
export interface PropertyGeo {
  latitude?: number;
  longitude?: number;
}

// Frontend Form Data (using camelCase for form convenience)
export interface PropertyLocation {
  region: string;
  province: string;
  city: string;
  barangay?: string;
  postalCode?: string;
  streetAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyMedia {
  id?: string;
  url?: string;
  isCover?: boolean;
  order?: number;
  filename?: string;
  size?: number;
}

// Frontend form data structure
export interface PropertyFormData {
  // Step 1: Basic Info
  title: string;
  property_type: string; // Matches backend field name
  price_php: string; // Matches backend field name
  bedrooms: string;
  bathrooms: string;
  lot_area_sqm: string; // Matches backend field name
  floor_area_sqm: string; // Matches backend field name
  description: string;

  // Step 2: Location
  region: string;
  province: string;
  city: string;
  barangay: string;
  postal_code: string; // Matches backend field name
  street_address: string; // Matches backend field name
  latitude: string;
  longitude: string;

  // Step 3: Media (handled separately)
  // media files will be uploaded via FormData
}

// Backend API Request Body
export interface CreatePropertyRequest {
  title: string;
  description: string;
  price_php: number;
  property_type: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area_sqm?: number;
  lot_area_sqm?: number;
  address: PropertyAddress;
  geo?: PropertyGeo;
}

// Response from Backend
export interface Property {
  id?: string;
  title: string;
  property_type: 'HOUSE' | 'CONDO' | 'TOWNHOUSE' | 'LOT' | 'APARTMENT' | 'COMMERCIAL';
  price_php: number;
  bedrooms: number;
  bathrooms: number;
  lot_area_sqm: number;
  floor_area_sqm: number;
  description: string;
  address: PropertyAddress;
  geo: PropertyGeo;
  media: PropertyMedia[];
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD' | 'ARCHIVED';
  views?: number;
  inquiries?: number;
  createdAt?: string;
  updatedAt?: string;
}

