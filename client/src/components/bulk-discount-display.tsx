import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, TrendingDown } from "lucide-react";
import { BulkDiscountTier, findApplicableDiscount, formatQuantityRange } from "@shared/bulk-discount-types";

interface BulkDiscountDisplayProps {
  basePrice: number;
  discounts: BulkDiscountTier[];
  selectedQuantity?: number;
}

export function BulkDiscountDisplay({ basePrice, discounts, selectedQuantity = 1 }: BulkDiscountDisplayProps) {
  if (!discounts || discounts.length === 0) {
    return null;
  }

  const formatQuantityRange = (tier: BulkDiscountTier) => {
    if (tier.maxQuantity === null) {
      return `${tier.minQuantity}+`;
    }
    return `${tier.minQuantity}-${tier.maxQuantity}`;
  };

  const getCurrentDiscount = () => {
    return discounts.find(tier => 
      selectedQuantity >= tier.minQuantity && 
      (tier.maxQuantity === null || selectedQuantity <= tier.maxQuantity)
    );
  };

  const currentDiscount = getCurrentDiscount();

  return (
    <Card className="border-green-200 bg-green-50/50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Volume Discount Pricing Tiers
        </CardTitle>
        <p className="text-sm text-green-700 mt-1">
          Buy more and save! Discounts automatically applied at checkout.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3">
          {discounts.map((tier, index) => {
            const isActive = selectedQuantity >= tier.minQuantity && 
                           (tier.maxQuantity === null || selectedQuantity <= tier.maxQuantity);
            
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                  isActive 
                    ? 'border-green-400 bg-green-100 shadow-md ring-2 ring-green-200 transform scale-[1.02]' 
                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={isActive ? "default" : "outline"}
                    className={`${isActive ? "bg-green-600 text-white shadow-sm" : "border-green-300 text-green-700"} font-semibold px-3 py-1`}
                  >
                    {formatQuantityRange(tier)} units
                  </Badge>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                      {tier.discountPercentage}% discount
                    </span>
                    {isActive && (
                      <span className="text-xs text-green-600">✓ Your current quantity</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold ${isActive ? 'text-green-700' : 'text-gray-900'}`}>
                    ${tier.discountedPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    was ${basePrice.toFixed(2)}
                  </div>
                  {isActive && (
                    <div className="text-xs text-green-600 font-medium">
                      Save ${(basePrice - tier.discountedPrice).toFixed(2)} each
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {currentDiscount && selectedQuantity > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-emerald-50 border-2 border-green-300 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">
                🎉 You're saving {currentDiscount.discountPercentage}% with {selectedQuantity} units!
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-green-700 font-medium">Total order savings:</div>
                <div className="text-lg font-bold text-green-800">
                  ${((basePrice - currentDiscount.discountedPrice) * selectedQuantity).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-green-700 font-medium">Per unit price:</div>
                <div className="text-lg font-bold text-green-800">
                  ${currentDiscount.discountedPrice.toFixed(2)}
                </div>
                <div className="text-xs text-green-600">
                  (was ${basePrice.toFixed(2)})
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-xs text-blue-700">
              <strong>How it works:</strong> Bulk discounts are automatically applied at checkout based on your cart quantity. 
              Mix and match products to reach higher discount tiers!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}