import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BulkDiscount {
  quantity: number;
  discount: number;
}

interface ProductInfoSidebarProps {
  productName: string;
  description: string;
  bulkDiscounts?: BulkDiscount[];
  price: string;
  imageUrl?: string;
  className?: string;
}

export function ProductInfoSidebar({ 
  productName, 
  description, 
  bulkDiscounts = [], 
  price,
  imageUrl,
  className = "" 
}: ProductInfoSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (originalPrice: string, discount: number) => {
    const numPrice = parseFloat(originalPrice.replace('$', ''));
    const discountedPrice = numPrice * (1 - discount / 100);
    return `$${discountedPrice.toFixed(2)}`;
  };

  return (
    <>
      {/* Info Icon Trigger */}
      <Button
        variant="ghost"
        size="sm"
        className={`p-1 h-6 w-6 rounded-full hover:bg-blue-100 ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-4 w-4 text-blue-600" />
      </Button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-8 w-8 rounded-full hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{productName}</h3>
                  <Badge variant="outline" className="text-sm">
                    Starting at {price}
                  </Badge>
                </div>

                {/* Product Image */}
                {imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={imageUrl} 
                      alt={productName}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <Separator className="my-4" />

                {/* Description */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                </div>

                {/* Bulk Pricing */}
                {bulkDiscounts && bulkDiscounts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Bulk Pricing</h4>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Volume Discounts Available</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {bulkDiscounts.map((discount, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {discount.quantity}+ units
                              </span>
                              <p className="text-xs text-gray-500">
                                {discount.discount}% off
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {formatPrice(price, discount.discount)}
                              </div>
                              <div className="text-xs text-gray-400 line-through">
                                {price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Tip:</strong> Order more units to unlock better pricing! 
                        Discounts apply automatically at checkout.
                      </p>
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                <div className="mt-6 pt-4 border-t">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsOpen(false)}
                  >
                    View Full Product Details
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}