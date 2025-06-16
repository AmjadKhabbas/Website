import { ShoppingCart, Plus, Minus, Edit2, ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { ProductWithCategory } from '@shared/schema';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { Link } from 'wouter';
import { useCartStore } from '@/lib/cart';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface ProductCardProps {
  product: ProductWithCategory;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, index = 0, viewMode = 'grid' }: ProductCardProps) {
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { items } = useCartStore();
  const { user, admin, isLoading, isAdmin, logoutMutation } = useAuth();
  const isAuthenticated = !!user || !!admin;
  const [newPrice, setNewPrice] = useState(product.price);
  const [newImageUrl, setNewImageUrl] = useState(product.imageUrl || '');
  const [newName, setNewName] = useState(product.name);
  const [newDescription, setNewDescription] = useState(product.description);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('Product deleted successfully!');
      setShowDeleteConfirm(false);
    },
    onError: () => {
      error('Failed to delete product');
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, price }: { productId: number; price: string }) => {
      await apiRequest('PATCH', `/api/admin/products/${productId}/price`, { price });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('Price updated successfully!');
    },
    onError: () => {
      error('Failed to update price');
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      await apiRequest('PATCH', `/api/admin/products/${productId}/image`, { imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('Image updated successfully!');
    },
    onError: () => {
      error('Failed to update image');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: number; updates: any }) => {
      await apiRequest('PATCH', `/api/admin/products/${productId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      success('Product updated successfully!');
      setShowEditDialog(false);
    },
    onError: () => {
      error('Failed to update product');
    },
  });

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

          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-2 right-2 space-y-1">
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-md"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this product?')) {
                    deleteProductMutation.mutate(product.id);
                  }
                }}
                disabled={deleteProductMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>

              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Product Name</label>
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Enter product description"
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Price</label>
                      <Input
                        type="text"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Image URL</label>
                      <Input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Enter image URL"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateProductMutation.mutate({ 
                            productId: product.id, 
                            updates: {
                              name: newName,
                              description: newDescription,
                              price: newPrice,
                              imageUrl: newImageUrl
                            }
                          });
                        }}
                        disabled={updateProductMutation.isPending}
                        className="flex-1"
                      >
                        {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowEditDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
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

        {/* Admin Controls - Grid View */}
        {isAdmin && (
          <div className="absolute top-4 right-4 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      disabled={deleteProductMutation.isPending}
                      className="flex-1"
                    >
                      {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="text"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter new price"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      updatePriceMutation.mutate({ 
                        productId: product.id, 
                        price: newPrice 
                      });
                    }}
                    disabled={updatePriceMutation.isPending}
                    className="w-full"
                  >
                    {updatePriceMutation.isPending ? 'Updating...' : 'Update Price'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
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