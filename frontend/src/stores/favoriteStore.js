import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useFavoriteStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      
      isFavorite: (id) => {
        const favorites = get().favorites;
        return favorites.some((item) => item.id === id);
      },

      toggleFavorite: (websiteData) =>
        set((state) => {
          const isFav = state.favorites.some(
            (item) => item.id === websiteData.id,
          );
          return {
            favorites: isFav
              ? state.favorites.filter((item) => item.id !== websiteData.id)
              : [...state.favorites, websiteData],
          };
        }),
    }),
    {
      name: "favorite-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
