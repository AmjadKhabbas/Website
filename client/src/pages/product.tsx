import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Trash2, X } from 'lucide-react';
import { Link, useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/product-card';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { BulkDiscountDisplay } from '@/components/bulk-discount-display';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { useCartStore } from '@/lib/cart';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Product, ProductWithCategory } from '@shared/schema';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { items } = useCartStore();
  const { isAdmin } = useAuth();

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
  
  // Initialize selectedQuantity with current cart quantity
  useEffect(() => {
    setSelectedQuantity(currentQuantity);
  }, [currentQuantity]);

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

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('Product deleted successfully!');
      setShowDeleteConfirm(false);
      // Redirect to products page after deletion
      setLocation('/products');
    },
    onError: () => {
      error('Failed to delete product');
    },
  });

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setSelectedQuantity(newQuantity);
    
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
    <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm py-4 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 text-blue-600 hover:text-blue-800 hover:bg-blue-100">
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
            {/* Product Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <ProductImageGallery
                images={[
                  product.imageUrl,
                  ...(product.imageUrls || [])
                ].filter(Boolean)}
                productName={product.name}
                hasDiscount={hasDiscount}
                discountPercentage={hasDiscount ? discountPercentage : undefined}
              />
              
              {/* Admin Delete Button - Overlay on Gallery */}
              {isAdmin && (
                <div className="absolute top-6 right-6 z-10">
                  <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-500/90 hover:bg-red-600 text-white rounded-full p-2 h-10 w-10 backdrop-blur-sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="flex gap-2">
                      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.name}"? This action cannot be undone and will redirect you back to the products page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteProductMutation.isPending ? 'Deleting...' : 'Delete Product'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                
                

                {/* Price */}
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.originalPrice!)}
                    </span>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-red-100 text-red-800 text-sm">
                      Save {formatPrice((parseFloat(product.originalPrice!) - parseFloat(product.price)).toString())}
                    </Badge>
                  )}
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {product.description}
                </p>



                {/* Bulk Pricing Indicator */}
                {product.bulkDiscounts && Array.isArray(product.bulkDiscounts) && product.bulkDiscounts.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-500 text-white font-semibold px-3 py-1">
                        💰 Bulk Pricing Available
                      </Badge>
                      <span className="text-sm text-gray-600">Save more when you buy in larger quantities</span>
                    </div>
                    <BulkDiscountDisplay
                      basePrice={parseFloat(product.price)}
                      discounts={product.bulkDiscounts}
                      selectedQuantity={selectedQuantity}
                    />
                  </div>
                )}
              </div>

              <Separator className="bg-gray-200" />

              {/* Quantity Controls */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="text-lg font-semibold text-gray-900">Add to Cart:</span>
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



                {/* Stock Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
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
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
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
