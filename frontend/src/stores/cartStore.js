import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      isInCart: (id) => get().items.some((item) => item.id === id),

     addItem: (newItem) => set((state) => {
  const exists = state.items.some((item) => item.id === newItem.id);
  if (exists) return state;

  // newItem mein API ka poora data hai (priceNormal, etc.)
  // Hum bas default values merge kar rahe hain
  const fullItem = {
    status: 'missing_details',
    project: 'Main Campaign',
    orderType: 'standard',
    writingOption: 'none',
    submissionData: { links: [], instructions: '' },
    isSelected: true,
    ...newItem // <--- Yahan API ke saare fields (priceNormal, etc.) aa jayenge
  };

  return { items: [...state.items, fullItem] };
}),

      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((item) => item.id !== id) 
      })),

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updates } : item)
      })),

      toggleSelection: (id) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, isSelected: !item.isSelected } : item
        )
      })),

      calculateItemTotal: (item) => {
        let total = item.priceNormal || 0; 
        if (item.orderType === 'sensitive') total += (item.priceSensitive || 0);
        if (item.orderType === 'casino') total += (item.priceCasino || 0);
        if (item.writingOption === 'outsource') total += (item.priceCopywriting || 0);
        return total;
      },

      calculateTotal: () => {
        const state = get();
        return state.items
          .filter((item) => item.isSelected)
          .reduce((acc, item) => acc + state.calculateItemTotal(item), 0);
      }
    }),
    {
      name: 'cart-storage', // Ye localStorage mein key ban jayegi
      storage: createJSONStorage(() => localStorage),
    }
  )
);