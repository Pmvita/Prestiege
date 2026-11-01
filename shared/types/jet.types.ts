import { BaseListing } from './listing.types';

export interface Jet extends BaseListing {
  type: 'private-jet' | 'helicopter' | 'turboprop';
  make: string;
  model: string;
  year: number;
  passengers: number;
  range: string;
  registration?: string;
  maxSpeed?: string;
  cabinHeight?: string;
  cabinWidth?: string;
  cabinLength?: string;
}

