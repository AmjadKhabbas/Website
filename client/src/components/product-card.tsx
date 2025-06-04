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
      className="group card-techno overflow-hidden hover:-translate-y-3"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-800/50 overflow-hidden border-b border-purple-500/30">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer filter group-hover:brightness-110"
          />
        </Link>
        
        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {hasDiscount && (
            <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold uppercase tracking-wider glow-pink">
              -{discountPercentage}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold uppercase tracking-wider glow-neon">
              NEXUS
            </Badge>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 w-12 h-12 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-purple-500/30 border border-purple-500/30 hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-110"
        >
          <Heart
            className={`w-6 h-6 transition-colors duration-300 ${
              isWishlisted ? 'text-pink-400 fill-pink-400' : 'text-purple-300 hover:text-cyan-400'
            }`}
          />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300 cursor-pointer uppercase tracking-wider text-lg">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-purple-200 mb-4 line-clamp-2 font-mono">
          {product.description}
        </p>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-purple-400 line-through font-mono">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 bg-slate-900/50 px-3 py-1 rounded-xl border border-purple-500/30">
            <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            <span className="text-sm text-cyan-400 font-bold font-mono">
              {product.rating}
            </span>
            <span className="text-sm text-purple-400 font-mono">
              ({product.reviewCount})
            </span>
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <Button
          onClick={() => addToCartMutation.mutate()}
          disabled={!product.inStock || addToCartMutation.isPending}
          className="w-full bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 hover:from-purple-700 hover:via-cyan-600 hover:to-purple-700 text-white py-4 rounded-2xl transition-all duration-300 font-bold uppercase tracking-wider transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
        >
          {addToCartMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>UPLOADING...</span>
            </div>
          ) : !product.inStock ? (
            'OFFLINE'
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>ACQUIRE</span>
            </div>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
