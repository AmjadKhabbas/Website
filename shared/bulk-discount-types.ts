// Bulk discount tier interface
export interface BulkDiscountTier {
  id: string; // Unique identifier for the tier
  minQuantity: number;
  maxQuantity: number | null; // null means "and above"
  discountPercentage: number;
  discountedPrice: number;
}

// Helper function to calculate discounted price
export function calculateDiscountedPrice(basePrice: number, discountPercentage: number): number {
  return basePrice * (1 - discountPercentage / 100);
}

// Helper function to find applicable discount for quantity
export function findApplicableDiscount(discounts: BulkDiscountTier[], quantity: number): BulkDiscountTier | null {
  if (!discounts || discounts.length === 0) return null;
  
  return discounts.find(tier => 
    quantity >= tier.minQuantity && 
    (tier.maxQuantity === null || quantity <= tier.maxQuantity)
  ) || null;
}

// Helper function to format quantity range display
export function formatQuantityRange(tier: BulkDiscountTier): string {
  if (tier.maxQuantity === null) {
    return `${tier.minQuantity}+`;
  }
  if (tier.minQuantity === tier.maxQuantity) {
    return `${tier.minQuantity}`;
  }
  return `${tier.minQuantity}-${tier.maxQuantity}`;
}

// Helper function to validate tier data
export function validateTier(tier: BulkDiscountTier, basePrice: number): string[] {
  const errors: string[] = [];
  
  if (tier.minQuantity < 1) {
    errors.push('Minimum quantity must be at least 1');
  }
  
  if (tier.maxQuantity !== null && tier.maxQuantity < tier.minQuantity) {
    errors.push('Maximum quantity must be greater than or equal to minimum quantity');
  }
  
  if (tier.discountPercentage < 0 || tier.discountPercentage > 100) {
    errors.push('Discount percentage must be between 0 and 100');
  }
  
  if (tier.discountedPrice <= 0) {
    errors.push('Discounted price must be greater than 0');
  }
  
  if (tier.discountedPrice >= basePrice) {
    errors.push('Discounted price must be less than base price');
  }
  
  return errors;
}

// Helper function to sort tiers by minimum quantity
export function sortTiersByQuantity(tiers: BulkDiscountTier[]): BulkDiscountTier[] {
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
}