import { Badge } from '@/components/ui/badge';

interface BulkDiscountTier {
  minQuantity: number;
  maxQuantity: number | null;
  discountPercentage: number;
  discountedPrice: number;
}

interface ProductTierDisplayProps {
  bulkDiscounts: BulkDiscountTier[];
  basePrice: number;
}

export function ProductTierDisplay({ bulkDiscounts, basePrice }: ProductTierDisplayProps) {
  if (!bulkDiscounts || bulkDiscounts.length === 0) {
    return null;
  }

  const formatQuantityRange = (tier: BulkDiscountTier) => {
    if (tier.maxQuantity === null) {
      return `${tier.minQuantity}+`;
    }
    return `${tier.minQuantity} - ${tier.maxQuantity}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Bulk Pricing</h4>
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 px-4 py-2 grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
          <div>Quantity</div>
          <div>Discount (%)</div>
          <div>Price</div>
        </div>
        
        {/* Pricing Tiers */}
        {bulkDiscounts.map((tier, index) => (
          <div 
            key={index} 
            className={`px-4 py-3 grid grid-cols-3 gap-4 text-sm ${
              index === 0 
                ? 'bg-blue-100' 
                : index % 2 === 0 
                ? 'bg-gray-50' 
                : 'bg-white'
            }`}
          >
            <div>
              <Badge 
                variant={index === 0 ? "default" : "secondary"}
                className={index === 0 ? "bg-blue-500 text-white" : ""}
              >
                {formatQuantityRange(tier)}
              </Badge>
            </div>
            <div className="text-gray-600">
              {tier.discountPercentage > 0 ? `${tier.discountPercentage.toFixed(2)}%` : '—'}
            </div>
            <div className="font-semibold text-blue-600">
              {formatPrice(tier.discountedPrice)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}