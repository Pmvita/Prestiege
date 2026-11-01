import { BaseListing } from './listing.types';

export interface Watch extends BaseListing {
  brand: string;
  model: string;
  reference: string;
  category: 'dress' | 'sports' | 'complication' | 'diver' | 'pilot';
  year: number;
  caseMaterial: string;
  movement: string;
  diameter: number;
  bracelet?: string;
  dial?: string;
  isLimited: boolean;
  limitedEdition?: string;
}

