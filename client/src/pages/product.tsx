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
import type { Product, ProductWithCategory } from '@shared/schema';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { success, error } = useToast();
  const queryClient = useQueryClient();

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

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/cart', {
        productId: parseInt(id!),
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      success(`Added ${quantity} item(s) to cart!`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h1>
          <p className="text-slate-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go Back Home</Button>
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
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-sm text-gray-300 border-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Quantity and Actions */}
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold text-white">Quantity:</span>
                  <div className="flex items-center border border-gray-600 rounded-lg bg-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 text-lg font-semibold border-x border-gray-600 text-white">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={() => addToCartMutation.mutate()}
                    disabled={!product.inStock || addToCartMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl"
                  >
                    {addToCartMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </div>
                    ) : !product.inStock ? (
                      'Out of Stock'
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </div>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="px-6"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? 'text-red-500 fill-red-500' : 'text-slate-600'
                      }`}
                    />
                  </Button>

                  <Button variant="outline" size="lg" className="px-6">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
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
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Related Products</h2>
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
