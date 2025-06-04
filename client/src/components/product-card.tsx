import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
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
  const [isWishlisted, setIsWishlisted] = useState(false);
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
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-100 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          {hasDiscount && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white ml-2">
              Featured
            </Badge>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-600'
            }`}
          />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-slate-500 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-slate-600 font-medium">
              {product.rating}
            </span>
            <span className="text-sm text-slate-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={() => addToCartMutation.mutate()}
          disabled={!product.inStock || addToCartMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addToCartMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    </motion.div>
  );
}
