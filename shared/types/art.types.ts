import { BaseListing } from './listing.types';

export interface Art extends BaseListing {
  artist: string;
  year: number;
  medium: string;
  category: 'painting' | 'sculpture' | 'photography' | 'drawing' | 'print' | 'installation' | 'contemporary';
  dimensions: {
    height: number;
    width: number;
    depth?: number;
    unit: 'cm' | 'in';
  };
  certification?: string;
  exhibitionHistory?: string[];
}

