import { BaseListing } from './listing.types';

export interface Estate extends BaseListing {
  type: 'villa' | 'mansion' | 'penthouse' | 'castle' | 'estate' | 'compound' | 'chalet' | 'apartment';
  category: 'residential' | 'commercial' | 'land';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: 'sqm' | 'sqft';
  yearBuilt?: number;
  lotSize?: number;
  amenities?: string[];
  features?: string[];
}

