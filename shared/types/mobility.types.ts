import { BaseListing } from './listing.types';

export interface Vehicle extends BaseListing {
  type: 'car' | 'motorcycle' | 'suv' | 'hypercar' | 'supercar' | 'classic' | 'exotic';
  make: string;
  model: string;
  year: number;
  mileage?: number;
  mileageUnit?: 'km' | 'mi';
  engine?: string;
  horsepower?: number;
  transmission?: string;
  fuelType?: string;
  color?: string;
  vin?: string;
  registrationCountry?: string;
}

