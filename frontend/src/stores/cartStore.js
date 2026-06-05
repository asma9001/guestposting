import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
 persist(
    (set, get) => ({
      items: [],

      
      isInCart: (cartEntryId) => get().items.some((item) => item.cartEntryId === cartEntryId),

      addItem: (newItem) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...newItem,
              cartEntryId: `${newItem.id}-${Date.now()}`,
              quantity: 1, 
            },
          ],
        })),

      removeItem: (cartEntryId) =>
        set((state) => ({
          items: state.items.filter((item) => item.cartEntryId !== cartEntryId),
        })),

      updateItem: (cartEntryId, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.cartEntryId === cartEntryId ? { ...item, ...updates } : item
          ),
        })),

      toggleSelection: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isSelected: !item.isSelected } : item,
          ),
        })),

      calculateItemTotal: (item) => {
        let total = item.priceNormal || 0;
        if (item.orderType === "sensitive") total += item.priceSensitive || 0;
        if (item.orderType === "casino") total += item.priceCasino || 0;
        if (item.writingOption === "outsource")
          total += item.priceCopywriting || 0;
        return total;
      },
      

      calculateTotal: () => {
        const state = get();
        return state.items
          .filter((item) => item.isSelected)
          .reduce((acc, item) => acc + state.calculateItemTotal(item), 0);
      },
    }),
    {
      name: "cart-storage", 
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
