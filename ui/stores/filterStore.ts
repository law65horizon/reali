import { create } from 'zustand';

interface FilterState {
  priceRange: { min: number; max: number };
  bedrooms: [number, number?];
  bathrooms: [number, number?];
  propertyTypes: string[];
  schoolRating: number | null;
  amenities: string[],
  setPriceRange: (range: { min: number; max: number }) => void;
  setBedrooms: (bedrooms: [number, number?]) => void;
  setBathrooms: (bedrooms: [number, number?]) => void;
  setPropertyTypes: (types: string[]) => void;
  setAmenities: (amenities: string[]) => void;
  setSchoolRating: (rating: number | null) => void;
  resetFilters: () => void;
}

interface EventFilterState {
  priceRange: { min: number; max: number };
  eventTypes: string[];
  duration: { min: number; max: number };
  amenities: string[];
  setPriceRange: (range: { min: number; max: number }) => void;
  setEventTypes: (types: string[]) => void;
  setDuration: (range: {min: number, max: number}) => void;
  setAmenities: (amenities: string[]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  priceRange: { min: 0, max: 1000000 },
  bedrooms: [0],
  bathrooms: [0],
  propertyTypes: [],
  schoolRating: null,
  amenities: [],
  setPriceRange: (range: {min: number, max: number}) => set({ priceRange: range }),
  setBedrooms: (bedrooms: [number, number?]) => set({ bedrooms }),
  setBathrooms: (bathrooms: [number, number?]) => set({ bathrooms }),
  setPropertyTypes: (types: string[]) => set({ propertyTypes: types }),
  setAmenities: (amenities: string[]) => set({ amenities }),
  setSchoolRating: (rating: number|null) => set({ schoolRating: rating }),
  
  resetFilters: () =>
    set({
      priceRange: { min: 0, max: 1000000 },
      bedrooms: [0],
      propertyTypes: [],
      schoolRating: null,
    }),
}));

export const useEventFilterStore = create<EventFilterState>((set) => ({
  priceRange: {min: 0, max: 500},
  eventTypes: [],
  duration: {min: 30, max: 240},
  amenities: [],
  setPriceRange: (range: {min: number, max: number}) => set({ priceRange: range }),
  setEventTypes: (types: string[]) => set({ eventTypes: types }),
  setDuration: (range: {min: number, max: number}) => set({ duration: range }),
  setAmenities: (amenities: string[]) => set({ amenities }),
  resetFilters: () =>
    set({
      priceRange: {min: 0, max: 500},
      eventTypes: [],
      duration: {min: 30, max: 240},
      amenities: [],
    }),
}));