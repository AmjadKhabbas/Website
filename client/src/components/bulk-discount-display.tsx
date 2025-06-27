import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";

export interface BulkDiscountTier {
  minQuantity: number;
  maxQuantity: number | null;
  discountPercentage: number;
  discountedPrice: number;
}

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
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-green-800 flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bulk Pricing Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          {discounts.map((tier, index) => {
            const isActive = selectedQuantity >= tier.minQuantity && 
                           (tier.maxQuantity === null || selectedQuantity <= tier.maxQuantity);
            
            return (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isActive 
                    ? 'border-green-400 bg-green-100 shadow-sm' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={isActive ? "default" : "outline"}
                    className={isActive ? "bg-green-600" : ""}
                  >
                    {formatQuantityRange(tier)} units
                  </Badge>
                  <span className="text-sm font-medium text-gray-700">
                    {tier.discountPercentage}% off
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${tier.discountedPrice.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 line-through">
                    ${basePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentDiscount && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">
                You're saving {currentDiscount.discountPercentage}% with {selectedQuantity} units!
              </span>
            </div>
            <div className="mt-1 text-sm text-green-700">
              Total savings: ${((basePrice - currentDiscount.discountedPrice) * selectedQuantity).toFixed(2)}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-3">
          * Bulk pricing automatically applied at checkout based on quantity
        </div>
      </CardContent>
    </Card>
  );
}