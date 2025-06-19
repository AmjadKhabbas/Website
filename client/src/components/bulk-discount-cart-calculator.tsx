import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calculator, TrendingDown, ShoppingCart } from 'lucide-react';

interface BulkDiscountTier {
  minQuantity: number;
  maxQuantity: number | null;
  discountPercentage: number;
  discountedPrice: number;
}

interface BulkDiscountCartCalculatorProps {
  basePrice: number;
  discounts: BulkDiscountTier[];
  productName: string;
}

export function BulkDiscountCartCalculator({ basePrice, discounts, productName }: BulkDiscountCartCalculatorProps) {
  const [quantity, setQuantity] = useState(1);

  const getCurrentDiscount = (qty: number) => {
    return discounts
      .filter(tier => qty >= tier.minQuantity)
      .filter(tier => tier.maxQuantity === null || qty <= tier.maxQuantity)
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
  };

  const formatQuantityRange = (tier: BulkDiscountTier) => {
    if (tier.maxQuantity === null) {
      return `${tier.minQuantity}+`;
    }
    return `${tier.minQuantity}-${tier.maxQuantity}`;
  };

  const currentDiscount = getCurrentDiscount(quantity);
  const unitPrice = currentDiscount ? currentDiscount.discountedPrice : basePrice;
  const totalPrice = unitPrice * quantity;
  const totalSavings = (basePrice - unitPrice) * quantity;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Bulk Pricing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-10 p-0"
            >
              -
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center h-10 w-20"
              min="1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-10 w-10 p-0"
            >
              +
            </Button>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 p-4 bg-white rounded-lg border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base Price:</span>
            <span className="font-medium">${basePrice.toFixed(2)}</span>
          </div>
          
          {currentDiscount && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discount Applied:</span>
                <Badge className="bg-green-600 text-white">
                  {currentDiscount.discountPercentage}% OFF
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="font-medium text-green-600">${unitPrice.toFixed(2)}</span>
              </div>
            </>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total ({quantity} units):</span>
              <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
            </div>
            
            {totalSavings > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Total Savings:</span>
                <span className="font-medium">${totalSavings.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Discount Tiers Table */}
        {discounts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Available Bulk Discounts</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Quantity</th>
                    <th className="px-3 py-2 text-left">Discount</th>
                    <th className="px-3 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((tier, index) => {
                    const isActive = quantity >= tier.minQuantity && 
                                   (tier.maxQuantity === null || quantity <= tier.maxQuantity);
                    
                    return (
                      <tr 
                        key={index}
                        className={`border-t ${isActive ? 'bg-blue-50' : 'bg-white'}`}
                      >
                        <td className="px-3 py-2">
                          <Badge variant={isActive ? "default" : "outline"}>
                            {formatQuantityRange(tier)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          {tier.discountPercentage}%
                        </td>
                        <td className="px-3 py-2 font-medium">
                          ${tier.discountedPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Next Tier Information */}
        {(() => {
          const nextTier = discounts.find(tier => tier.minQuantity > quantity);
          if (nextTier) {
            const needed = nextTier.minQuantity - quantity;
            return (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Add {needed} more unit{needed > 1 ? 's' : ''} to get {nextTier.discountPercentage}% off!
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
}