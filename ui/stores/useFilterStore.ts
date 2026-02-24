import { create } from 'zustand';

export interface FilterState {
  variables: {
    minPrice: number | undefined;
    maxPrice: number | undefined;
    minSize: number | undefined;
    maxSize: number | undefined;
    checkIn: string,
    checkOut: string,
    propertyType: string[] // Room | Entire home | Any
    sale_status: string; // Rent | Sale | Any
    // bedrooms: number | undefined;
    beds: number | undefined;
    bathrooms: number | undefined;
    amenities: string[];
  } | null
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minSize: number | undefined;
  maxSize: number | undefined;
  checkIn: string,
  checkOut: string,
  propertyType: string[]; // Room | Entire home | Any
  listingType: string; // Rent | Sale | Any
  bedrooms: number | undefined;
  beds: number | undefined;
  bathrooms: number | undefined;
  amenities: string[];
  accessibility: string[];
  propertyCategory: string; // House | Flat | Guest house | Hotel | Any
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'clearAll'>, value: FilterState[`${keyof Omit<FilterState, 'setFilter' | 'clearAll'>}`]) => void;
  clearAll: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  variables: null,
  minPrice: undefined,
  maxPrice: undefined,
  minSize: undefined,
  maxSize: undefined,
  checkIn: '',
  checkOut: '',
  propertyType: [],
  listingType: 'Any',
  bedrooms: undefined,
  beds: undefined,
  bathrooms: undefined,
  amenities: [],
  accessibility: [],
  propertyCategory: 'Any',
  setFilter: (key, value) => set(() => ({ [key]: value } as any)),
  clearAll: () =>
    set({
      variables: null,
      minPrice: undefined,
      maxPrice: undefined,
      minSize: undefined,
      maxSize: undefined,
      checkIn: '',
      checkOut: '',
      propertyType: [],
      listingType: 'Any',
      bedrooms: undefined,
      beds: undefined,
      bathrooms: undefined,
      amenities: [],
      accessibility: [],
      propertyCategory: 'Any',
    }),
}));


