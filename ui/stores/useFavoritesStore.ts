
// stores/useFavoritesStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesStore {
  favoriteIds: Set<string>;
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: new Set<string>(),

      toggleFavorite: (propertyId) =>
        set((state) => {
          const newFavorites = new Set(state.favoriteIds);
          if (newFavorites.has(propertyId)) {
            newFavorites.delete(propertyId);
          } else {
            newFavorites.add(propertyId);
          }
          return { favoriteIds: newFavorites };
        }),

      isFavorite: (propertyId) => get().favoriteIds.has(propertyId),

      clearFavorites: () => set({ favoriteIds: new Set() }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Custom serialization for Set
      partialize: (state) => ({
        favoriteIds: Array.from(state.favoriteIds),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.favoriteIds = new Set(state.favoriteIds as any);
        }
      },
    }
  )
);