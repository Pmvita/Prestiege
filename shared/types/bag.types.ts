import { BaseListing } from './listing.types';

export interface Bag extends BaseListing {
  brand: string;
  model: string;
  category: 'handbag' | 'tote' | 'clutch' | 'backpack' | 'luggage';
  subcategory?: string;
  year: number;
  materials: string[];
  hardware?: string;
  dimensions?: {
    length: number;
    height: number;
    width: number;
    unit: 'cm' | 'in';
  };
  serialNumber?: string;
  isLimited: boolean;
  edition?: string;
}

