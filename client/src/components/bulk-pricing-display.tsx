import { Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface BulkPricingTier {
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  price: number;
}

interface BulkPricingDisplayProps {
  basePrice: number;
  quantity: number;
  className?: string;
}

export function BulkPricingDisplay({ basePrice, quantity, className = "" }: BulkPricingDisplayProps) {
  // Standard bulk pricing tiers
  const tiers: BulkPricingTier[] = [
    { minQty: 1, maxQty: 5, discountPercent: 0, price: basePrice },
    { minQty: 6, maxQty: 10, discountPercent: 2.64, price: basePrice * 0.9736 },
    { minQty: 11, maxQty: 20, discountPercent: 3.96, price: basePrice * 0.9604 },
    { minQty: 21, maxQty: null, discountPercent: 5.28, price: basePrice * 0.9472 }
  ];

  // Find current tier based on quantity
  const currentTier = tiers.find(tier => 
    quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
  ) || tiers[0];

  const savings = basePrice - currentTier.price;
  const totalSavings = savings * quantity;

  const formatQuantityRange = (tier: BulkPricingTier) => {
    if (tier.maxQty === null) {
      return `${tier.minQty}+ units`;
    }
    if (tier.minQty === tier.maxQty) {
      return `${tier.minQty} unit${tier.minQty > 1 ? 's' : ''}`;
    }
    return `${tier.minQty}-${tier.maxQty} units`;
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Bulk Pricing Available</h3>
      </div>

      <div className="space-y-2">
        {tiers.map((tier, index) => {
          const isCurrentTier = tier === currentTier;
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-md border ${
                isCurrentTier
                  ? 'bg-green-100 border-green-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-medium text-sm ${
                  isCurrentTier ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {formatQuantityRange(tier)}
                </span>
                <span className={`text-sm ${
                  isCurrentTier ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {tier.discountPercent}% off
                </span>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  isCurrentTier ? 'text-green-800' : 'text-gray-900'
                }`}>
                  {formatPrice(tier.price)}
                </div>
                {tier.discountPercent > 0 && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(basePrice)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Savings indicator */}
      <div className="mt-4 p-3 bg-green-100 rounded-md border border-green-300">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            You're saving {currentTier.discountPercent}% with {quantity} unit{quantity !== 1 ? 's' : ''}!
          </span>
        </div>
        <div className="text-sm text-green-700 mt-1">
          Total savings: {formatPrice(totalSavings)}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        * Bulk pricing automatically applied at checkout based on quantity
      </p>
    </div>
  );
}