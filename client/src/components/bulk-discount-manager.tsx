import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BulkDiscountTier {
  minQuantity: number;
  maxQuantity: number | null; // null means "and above"
  discountPercentage: number;
  discountedPrice: number;
}

interface BulkDiscountManagerProps {
  basePrice: number;
  discounts: BulkDiscountTier[];
  onChange: (discounts: BulkDiscountTier[]) => void;
}

export function BulkDiscountManager({ basePrice, discounts, onChange }: BulkDiscountManagerProps) {
  const [newTier, setNewTier] = useState<{
    minQuantity: number;
    maxQuantity: number | null;
    discountPercentage: number;
    discountedPrice: number;
  }>({
    minQuantity: 1,
    maxQuantity: null,
    discountPercentage: 0,
    discountedPrice: basePrice
  });

  const calculateDiscountedPrice = (discountPercentage: number) => {
    return basePrice * (1 - discountPercentage / 100);
  };

  const addTier = () => {
    if (newTier.minQuantity && newTier.discountPercentage !== undefined) {
      const tier: BulkDiscountTier = {
        minQuantity: newTier.minQuantity,
        maxQuantity: newTier.maxQuantity || null,
        discountPercentage: newTier.discountPercentage,
        discountedPrice: calculateDiscountedPrice(newTier.discountPercentage)
      };
      
      const updatedDiscounts = [...discounts, tier].sort((a, b) => a.minQuantity - b.minQuantity);
      onChange(updatedDiscounts);
      
      // Reset form
      setNewTier({
        minQuantity: (updatedDiscounts[updatedDiscounts.length - 1]?.maxQuantity || 0) + 1,
        maxQuantity: null,
        discountPercentage: 0,
        discountedPrice: basePrice
      });
    }
  };

  const removeTier = (index: number) => {
    const updatedDiscounts = discounts.filter((_, i) => i !== index);
    onChange(updatedDiscounts);
  };

  const updateTier = (index: number, field: keyof BulkDiscountTier, value: number | null) => {
    const updatedDiscounts = [...discounts];
    updatedDiscounts[index] = {
      ...updatedDiscounts[index],
      [field]: value
    };
    
    // Recalculate discounted price if percentage changed
    if (field === 'discountPercentage') {
      updatedDiscounts[index].discountedPrice = calculateDiscountedPrice(value as number);
    }
    
    onChange(updatedDiscounts.sort((a, b) => a.minQuantity - b.minQuantity));
  };

  const formatQuantityRange = (tier: BulkDiscountTier) => {
    if (tier.maxQuantity === null) {
      return `${tier.minQuantity}+`;
    }
    return `${tier.minQuantity} - ${tier.maxQuantity}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Bulk Discount Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tiers - Table View */}
        {discounts.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Bulk Pricing Tiers</Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-100 dark:bg-blue-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Discount (%)
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {discounts.map((tier, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`border-b ${
                          index === 0 
                            ? 'bg-blue-50 dark:bg-blue-950' 
                            : index % 2 === 0 
                            ? 'bg-gray-50 dark:bg-gray-800' 
                            : 'bg-white dark:bg-gray-900'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Badge 
                            variant={index === 0 ? "default" : "secondary"} 
                            className={index === 0 ? "bg-blue-500 text-white" : ""}
                          >
                            {formatQuantityRange(tier)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={tier.discountPercentage}
                              onChange={(e) => updateTier(index, 'discountPercentage', parseFloat(e.target.value) || 0)}
                              className="h-8 w-20"
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-green-600">
                            ${tier.discountedPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTier(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add New Tier */}
        <div className="space-y-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <Label className="text-sm font-medium">Add New Discount Tier</Label>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minQuantity" className="text-xs">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                placeholder="1"
                value={newTier.minQuantity || ''}
                onChange={(e) => setNewTier(prev => ({ 
                  ...prev, 
                  minQuantity: parseInt(e.target.value) || 1 
                }))}
                min="1"
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxQuantity" className="text-xs">Max Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                placeholder="Leave empty for +"
                value={newTier.maxQuantity || ''}
                onChange={(e) => setNewTier(prev => ({ 
                  ...prev, 
                  maxQuantity: e.target.value ? parseInt(e.target.value) : null 
                }))}
                min={newTier.minQuantity || 1}
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountPercentage" className="text-xs">Discount %</Label>
              <div className="relative">
                <Input
                  id="discountPercentage"
                  type="number"
                  placeholder="0"
                  value={newTier.discountPercentage || ''}
                  onChange={(e) => {
                    const percentage = parseFloat(e.target.value) || 0;
                    setNewTier(prev => ({ 
                      ...prev, 
                      discountPercentage: percentage,
                      discountedPrice: calculateDiscountedPrice(percentage)
                    }));
                  }}
                  min="0"
                  max="100"
                  step="0.1"
                  className="h-9 pr-8"
                />
                <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">New Price</Label>
              <div className="flex items-center gap-1 h-9 px-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">
                  {newTier.discountedPrice?.toFixed(2) || basePrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-gray-500">
              Base price: ${basePrice.toFixed(2)}
              {newTier.discountPercentage > 0 && (
                <span className="ml-2 text-green-600">
                  Save ${(basePrice - (newTier.discountedPrice || basePrice)).toFixed(2)}
                </span>
              )}
            </div>
            <Button
              type="button"
              onClick={addTier}
              disabled={!newTier.minQuantity || newTier.discountPercentage === undefined}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          </div>
        </div>

        {/* Preview Table */}
        {discounts.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pricing Preview</Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 grid grid-cols-3 gap-4 text-sm font-medium">
                <div>Quantity</div>
                <div>Discount (%)</div>
                <div>Price</div>
              </div>
              {discounts.map((tier, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 grid grid-cols-3 gap-4 text-sm ${
                    index === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'
                  } ${index !== discounts.length - 1 ? 'border-b' : ''}`}
                >
                  <div className="font-medium">{formatQuantityRange(tier)}</div>
                  <div className="text-green-600 font-medium">
                    {tier.discountPercentage === 0 ? '—' : `${tier.discountPercentage}%`}
                  </div>
                  <div className="font-medium">${tier.discountedPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}