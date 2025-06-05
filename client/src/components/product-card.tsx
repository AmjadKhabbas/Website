import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductWithCategory } from '@shared/schema';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { Link } from 'wouter';
import { useCartStore } from '@/lib/cart';

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, index = 0, viewMode = 'grid' }: ProductCardProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { items } = useCartStore();

  // Get current quantity in cart
  const cartItem = items.find(item => item.product.id === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const addToCartMutation = useMutation({
    mutationFn: async (quantity: number) => {
      await apiRequest('POST', '/api/cart', {
        productId: product.id,
        quantity: quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      success('Cart updated!');
    },
    onError: () => {
      error('Failed to update cart');
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
      if (quantity === 0) {
        await apiRequest('DELETE', `/api/cart/${cartItemId}`);
      } else {
        await apiRequest('PUT', `/api/cart/${cartItemId}`, { quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      error('Failed to update quantity');
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    if (cartItem) {
      // Item exists in cart, update it
      updateQuantityMutation.mutate({ cartItemId: cartItem.id, quantity: newQuantity });
    } else if (newQuantity > 0) {
      // Item doesn't exist, add it
      addToCartMutation.mutate(newQuantity);
    }
  };

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

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex items-center p-6 gap-6"
      >
        {/* Image Container - List View */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-50 to-slate-50 overflow-hidden rounded-lg flex-shrink-0">
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
          <div className="absolute top-2 left-2 space-y-1">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white font-semibold text-xs">
                -{discountPercentage}%
              </Badge>
            )}
          </div>
        </div>
        
        {/* Content - List View */}
        <div className="flex-1 flex flex-col justify-between min-h-[8rem]">
          <div>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer text-xl">
                {product.name}
              </h3>
            </Link>
            
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {/* Price */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Quantity Controls - List View */}
        <div className="flex-shrink-0 w-48">
          {!product.inStock ? (
            <Button disabled className="w-full py-2 rounded-lg font-semibold">
              Out of Stock
            </Button>
          ) : currentQuantity === 0 ? (
            <Button
              onClick={() => handleQuantityChange(1)}
              disabled={addToCartMutation.isPending}
              className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg transition-all duration-300 font-semibold transform hover:scale-[1.02]"
            >
              {addToCartMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </div>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-600 rounded-lg p-2">
              <Button
                onClick={() => handleQuantityChange(currentQuantity - 1)}
                disabled={updateQuantityMutation.isPending}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="flex-1 text-center font-semibold text-blue-700 text-lg">
                {currentQuantity}
              </span>
              
              <Button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                disabled={updateQuantityMutation.isPending}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

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
        
        {/* Quantity Controls - Always at bottom */}
        <div className="mt-auto">
          {!product.inStock ? (
            <Button disabled className="w-full py-3 rounded-lg font-semibold">
              Out of Stock
            </Button>
          ) : currentQuantity === 0 ? (
            <Button
              onClick={() => handleQuantityChange(1)}
              disabled={addToCartMutation.isPending}
              className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-lg transition-all duration-300 font-semibold transform hover:scale-[1.02]"
            >
              {addToCartMutation.isPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </div>
              )}
            </Button>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-600 rounded-lg p-2">
              <Button
                onClick={() => handleQuantityChange(currentQuantity - 1)}
                disabled={updateQuantityMutation.isPending}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="flex-1 text-center font-semibold text-blue-700 text-lg">
                {currentQuantity}
              </span>
              
              <Button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                disabled={updateQuantityMutation.isPending}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
