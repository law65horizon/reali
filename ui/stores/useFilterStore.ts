import { create } from 'zustand';

export interface FilterState {
  priceRange: [number, number];
  propertyType: string; // Room | Entire home | Any
  listingType: string; // Rent | Sale | Any
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  accessibility: string[];
  propertyCategory: string; // House | Flat | Guest house | Hotel | Any
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'clearAll'>, value: any) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  priceRange: [0, 1000],
  propertyType: 'Any',
  listingType: 'Any',
  bedrooms: 0,
  beds: 0,
  bathrooms: 0,
  amenities: [],
  accessibility: [],
  propertyCategory: 'Any',
  setFilter: (key, value) => set(() => ({ [key]: value } as any)),
  clearAll: () =>
    set({
      priceRange: [0, 1000],
      propertyType: 'Any',
      listingType: 'Any',
      bedrooms: 0,
      beds: 0,
      bathrooms: 0,
      amenities: [],
      accessibility: [],
      propertyCategory: 'Any',
    }),
}));


