// Prestiege Listing Types

export interface BaseListing {
  id: string;
  name: string;
  value: {
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'CHF';
  };
  location: {
    country: string;
    city: string;
    facility?: string;
  };
  status: 'available' | 'sold' | 'reserved' | 'off-market' | 'private-collection';
  condition: 'new' | 'excellent' | 'very-good' | 'good' | 'fair';
  images: string[];
  listingUrl?: string[];
  provenance?: string;
  acquisitionDate?: string;
  insurance?: Insurance;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  coverageUSD: number;
  renewalDate: string;
  notes?: string;
}

