import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItemWithProduct } from '@shared/schema';
import { BulkDiscountTier, findApplicableDiscount } from '@shared/bulk-discount-types';

interface CartStore {
  items: CartItemWithProduct[];
  isOpen: boolean;
  sessionId: string;
  setItems: (items: CartItemWithProduct[]) => void;
  addItem: (item: CartItemWithProduct) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getBulkDiscountPrice: (item: CartItemWithProduct) => number;
  getItemTotalPrice: (item: CartItemWithProduct) => number;
  generateSessionId: () => string;
}

// Generate a unique session ID for cart tracking
const generateUniqueSessionId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      sessionId: generateUniqueSessionId(),
      setItems: (items) => set({ items }),
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      generateSessionId: () => {
        const newSessionId = generateUniqueSessionId();
        set({ sessionId: newSessionId });
        return newSessionId;
      },
      getBulkDiscountPrice: (item: CartItemWithProduct) => {
        // Parse bulk discounts from product if available
        const bulkDiscounts = item.product.bulkDiscounts as BulkDiscountTier[] || [];
        if (bulkDiscounts.length === 0) {
          return parseFloat(item.product.price);
        }

        // Find the applicable discount tier based on quantity
        const applicableTier = bulkDiscounts
          .filter(tier => item.quantity >= tier.minQuantity)
          .filter(tier => tier.maxQuantity === null || item.quantity <= tier.maxQuantity)
          .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

        return applicableTier ? applicableTier.discountedPrice : parseFloat(item.product.price);
      },
      getItemTotalPrice: (item: CartItemWithProduct) => {
        const { getBulkDiscountPrice } = get();
        const unitPrice = getBulkDiscountPrice(item);
        return unitPrice * item.quantity;
      },
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const { items, getItemTotalPrice } = get();
        return items.reduce((total, item) => total + getItemTotalPrice(item), 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
