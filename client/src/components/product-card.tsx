import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductWithCategory } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { Link } from 'wouter';

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      success('Product added to cart!');
    },
    onError: () => {
      error('Failed to add product to cart');
    },
  });

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>
        
        {/* Medical overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {hasDiscount && (
            <Badge className="bg-red-500 text-white font-semibold">
              -{discountPercentage}%
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col h-full">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer text-lg">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button - Always at bottom */}
        <div className="mt-auto">
          <Button
            onClick={() => addToCartMutation.mutate()}
            disabled={!product.inStock || addToCartMutation.isPending}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-lg transition-all duration-300 font-semibold transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addToCartMutation.isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : !product.inStock ? (
              'Out of Stock'
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
