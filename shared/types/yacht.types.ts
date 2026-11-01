import { BaseListing } from './listing.types';

export interface Yacht extends BaseListing {
  type: 'superyacht' | 'megayacht' | 'sailing' | 'motor-yacht';
  make: string;
  model: string;
  year: number;
  length: number;
  lengthUnit: 'm' | 'ft';
  beam?: number;
  draft?: number;
  cabins: number;
  guests: number;
  crew: number;
  builder: string;
  topSpeed?: string;
  cruisingSpeed?: string;
}

