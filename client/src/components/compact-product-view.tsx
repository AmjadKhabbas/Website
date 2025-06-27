import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { CompareIcon } from '@/components/compare-button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: number;
  inStock: boolean;
  featured: boolean;
  rating: string;
  reviewCount: number;
  tags?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  bulkDiscounts?: Array<{
    minQuantity: number;
    maxQuantity: number | null;
    discountPercentage: number;
    discountedPrice: number;
  }>;
}

interface CompactProductViewProps {
  products: Product[];
}

export function CompactProductView({ products }: CompactProductViewProps) {
  const { user, admin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest('POST', '/api/cart', { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to Cart",
        description: "Product added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  });

  const handleQuantityChange = (productId: number, value: string) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const getBestPrice = (product: Product, quantity: number) => {
    if (!product.bulkDiscounts || product.bulkDiscounts.length === 0) {
      return parseFloat(product.price);
    }

    const basePrice = parseFloat(product.price);
    
    // Find the applicable bulk discount
    const applicableDiscount = product.bulkDiscounts
      .filter(discount => 
        quantity >= discount.minQuantity && 
        (discount.maxQuantity === null || quantity <= discount.maxQuantity)
      )
      .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];

    if (applicableDiscount) {
      return basePrice * (1 - applicableDiscount.discountPercentage / 100);
    }

    return basePrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, index) => {
        const quantity = quantities[product.id] || 1;
        const unitPrice = getBestPrice(product, quantity);
        const originalPrice = parseFloat(product.price);
        const hasDiscount = unitPrice < originalPrice;
        const totalPrice = unitPrice * quantity;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.featured && (
                  <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                    Featured
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                    Bulk Discount
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {product.category.name}
                    </Badge>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(unitPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  {quantity > 1 && (
                    <div className="text-sm text-gray-600 mt-1">
                      Total: <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                  )}
                </div>

                {product.inStock && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="w-20 h-8 text-sm"
                        placeholder="Qty"
                      />
                      <Button
                        size="sm"
                        onClick={() => addToCartMutation.mutate({ productId: product.id, quantity })}
                        disabled={addToCartMutation.isPending}
                        className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/product/${product.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-8 text-sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </Link>
                      <CompareIcon product={product} />
                    </div>
                  </div>
                )}
                
                {!product.inStock && (
                  <div className="flex gap-2">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-8 text-sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </Link>
                    <CompareIcon product={product} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}