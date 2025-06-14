import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Minus, Plus, ArrowLeft, Share2 } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product-card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { useCartStore } from '@/lib/cart';
import type { Product, ProductWithCategory } from '@shared/schema';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { items } = useCartStore();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    queryFn: async () => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      return response.json();
    },
  });

  const { data: relatedProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products', 'related', product?.categoryId],
    queryFn: async () => {
      if (!product) return [];
      const response = await fetch(`/api/products?categoryId=${product.categoryId}&limit=4`);
      const products = await response.json();
      return products.filter((p: Product) => p.id !== product.id);
    },
    enabled: !!product,
  });

  // Get current quantity in cart
  const cartItem = items.find(item => item.product.id === parseInt(id!));
  const currentQuantity = cartItem?.quantity || 0;

  const addToCartMutation = useMutation({
    mutationFn: async (quantity: number) => {
      await apiRequest('POST', '/api/cart', {
        productId: parseInt(id!),
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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-16 bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-16 bg-black">
      {/* Breadcrumb */}
      <div className="bg-gray-900 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-300 hover:text-white hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-red-500 hover:bg-red-600 text-white text-lg px-3 py-1">
                      -{discountPercentage}%
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(parseFloat(product.rating))
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-white">{product.rating}</span>
                  <span className="text-gray-400">({product.reviewCount} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-4xl font-bold text-white">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice!)}
                    </span>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-red-900 text-red-400 text-sm">
                      Save {formatPrice((parseFloat(product.originalPrice!) - parseFloat(product.price)).toString())}
                    </Badge>
                  )}
                </div>

                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm text-gray-300 border-gray-600">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Quantity Controls */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="text-lg font-semibold text-white">Add to Cart:</span>
                  {!product.inStock ? (
                    <Button disabled className="w-full py-4 rounded-lg font-semibold text-lg">
                      Out of Stock
                    </Button>
                  ) : currentQuantity === 0 ? (
                    <Button
                      onClick={() => handleQuantityChange(1)}
                      disabled={addToCartMutation.isPending}
                      className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-4 rounded-lg transition-all duration-300 font-semibold text-lg transform hover:scale-[1.02]"
                    >
                      {addToCartMutation.isPending ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Adding...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <ShoppingCart className="w-5 h-5" />
                          <span>Add to Cart</span>
                        </div>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                      <Button
                        onClick={() => handleQuantityChange(currentQuantity - 1)}
                        disabled={updateQuantityMutation.isPending}
                        size="lg"
                        variant="ghost"
                        className="h-12 w-12 p-0 text-blue-600 hover:bg-blue-100 text-xl"
                      >
                        <Minus className="w-6 h-6" />
                      </Button>
                      
                      <span className="flex-1 text-center font-bold text-blue-700 text-2xl">
                        {currentQuantity}
                      </span>
                      
                      <Button
                        onClick={() => handleQuantityChange(currentQuantity + 1)}
                        disabled={updateQuantityMutation.isPending}
                        size="lg"
                        variant="ghost"
                        className="h-12 w-12 p-0 text-blue-600 hover:bg-blue-100 text-xl"
                      >
                        <Plus className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-300'
                      }`}
                    />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </Button>

                  <Button variant="outline" size="lg" className="px-6 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`font-medium ${product.inStock ? 'text-green-400' : 'text-red-400'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
