import { BaseListing } from './listing.types';

export interface Jewelry extends BaseListing {
  brand: string;
  category: 'necklace' | 'bracelet' | 'ring' | 'earrings' | 'pendant' | 'brooch';
  materials: string[];
  gemstones?: string[];
  caratWeight?: number;
  metal?: string;
  designer?: string;
}

