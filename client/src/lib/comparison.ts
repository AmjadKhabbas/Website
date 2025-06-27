import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  imageUrls?: string[];
  categoryId: number;
  featured: boolean;
  inStock: boolean;
  rating: string;
  reviewCount: number;
  tags?: string;
  bulkDiscounts?: any;
}

interface ComparisonStore {
  comparedProducts: Product[];
  addToComparison: (product: Product) => { success: boolean; message: string };
  removeFromComparison: (productId: number) => void;
  clearComparison: () => void;
  isInComparison: (productId: number) => boolean;
  getComparisonCount: () => number;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set, get) => ({
      comparedProducts: [],
      
      addToComparison: (product: Product) => {
        const state = get();
        
        if (state.comparedProducts.length >= 4) {
          return {
            success: false,
            message: "You can compare up to 4 products at once."
          };
        }
        
        if (state.comparedProducts.find(p => p.id === product.id)) {
          return {
            success: false,
            message: "This product is already in your comparison."
          };
        }
        
        set(state => ({
          comparedProducts: [...state.comparedProducts, product]
        }));
        
        return {
          success: true,
          message: `${product.name} has been added to comparison.`
        };
      },
      
      removeFromComparison: (productId: number) => {
        set(state => ({
          comparedProducts: state.comparedProducts.filter(p => p.id !== productId)
        }));
      },
      
      clearComparison: () => {
        set({ comparedProducts: [] });
      },
      
      isInComparison: (productId: number) => {
        return get().comparedProducts.some(p => p.id === productId);
      },
      
      getComparisonCount: () => {
        return get().comparedProducts.length;
      }
    }),
    {
      name: 'comparison-storage',
    }
  )
);