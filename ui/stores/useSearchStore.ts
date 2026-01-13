// stores/useSearchStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ListingType = 'rental' | 'purchase' | 'hotels';
export type PropertySegment = 'for-sale' | 'for-rent' | 'sold';

interface SearchFilters {
  location: string;
  segment: PropertySegment;
  priceRange: { min: number; max: number };
  bedrooms: number | 'any';
  bathrooms: number | 'any';
  beds: number | 'any';
  propertyTypes: string[];
  amenities: string[];
  features: string[];
}

interface RecentSearch {
  query: string;
  timestamp: number;
  filters: SearchFilters;
}

interface SearchStore {
  // Current search state
  query: string;
  filters: SearchFilters;
  listingType: ListingType;
  
  // Recent searches (persist)
  recentSearches: RecentSearch[];
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setListingType: (type: ListingType) => void;
  clearFilters: () => void;
  saveSearch: () => void;
  getActiveFilterCount: () => number;
}

const initialFilters: SearchFilters = {
  location: '',
  segment: 'for-sale',
  priceRange: { min: 0, max: 10000 },
  bedrooms: 'any',
  bathrooms: 'any',
  beds: 'any',
  propertyTypes: [],
  amenities: [],
  features: [],
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set, get) => ({
      query: '',
      filters: initialFilters,
      listingType: 'rental',
      recentSearches: [],

      setQuery: (query) => set({ query }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      setListingType: (type) => set({ listingType: type }),

      clearFilters: () => set({ filters: initialFilters }),

      saveSearch: () => {
        const { query, filters, recentSearches } = get();
        if (!query.trim()) return;

        const newSearch: RecentSearch = {
          query,
          timestamp: Date.now(),
          filters: { ...filters },
        };

        set({
          recentSearches: [
            newSearch,
            ...recentSearches.filter((s) => s.query !== query),
          ].slice(0, 10), // Keep last 10
        });
      },

      getActiveFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.bedrooms !== 'any') count++;
        if (filters.bathrooms !== 'any') count++;
        if (filters.beds !== 'any') count++;
        if (filters.propertyTypes.length > 0) count++;
        if (filters.amenities.length > 0) count++;
        if (filters.features.length > 0) count++;
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
        return count;
      },
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        listingType: state.listingType,
      }),
    }
  )
);
