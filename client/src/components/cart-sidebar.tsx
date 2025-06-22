import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, AlertCircle, Lock, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';

export function CartSidebar() {
  const { items, isOpen, closeCart, getTotalPrice, getTotalItems, getBulkDiscountPrice, getItemTotalPrice } = useCartStore();
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { user, admin, isLoading } = useAuth();
  const isAuthenticated = !!user || !!admin;

  // Check checkout eligibility
  const { data: eligibility } = useQuery({
    queryKey: ['/api/checkout/eligibility'],
    enabled: items.length > 0,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      await apiRequest('PUT', `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      success('Cart updated');
    },
    onError: () => {
      error('Failed to update cart');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      success('Item removed from cart');
    },
    onError: () => {
      error('Failed to remove item');
    },
  });

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ id, quantity: newQuantity });
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeCart}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">
                  Shopping Cart ({getTotalItems()})
                </h3>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h4>
                  <p className="text-slate-600">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-4 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow duration-200"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        
                        {/* Pricing with bulk discount */}
                        <div className="space-y-1">
                          {(() => {
                            const unitPrice = getBulkDiscountPrice(item);
                            const originalPrice = parseFloat(item.product.price);
                            const isDiscounted = unitPrice < originalPrice;
                            
                            return (
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-blue-600">
                                  {formatPrice(unitPrice)}
                                </p>
                                {isDiscounted && (
                                  <>
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatPrice(originalPrice)}
                                    </p>
                                    <Badge className="bg-green-100 text-green-800 text-xs">
                                      BULK
                                    </Badge>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                          
                          {/* Item total */}
                          <p className="text-sm text-gray-600">
                            Total: {formatPrice(getItemTotalPrice(item))}
                          </p>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={updateQuantityMutation.isPending}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-slate-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                {/* Checkout Status and Actions */}
                {!isAuthenticated ? (
                  <div className="space-y-3">
                    <Alert>
                      <LogIn className="h-4 w-4" />
                      <AlertDescription>
                        You can add items to cart as a guest, but need to log in to complete your purchase.
                      </AlertDescription>
                    </Alert>
                    <Link href="/auth">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold">
                        <LogIn className="w-5 h-5 mr-2" />
                        Login to Checkout
                      </Button>
                    </Link>
                  </div>
                ) : admin ? (
                  <Link href="/checkout">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      Proceed to Checkout (Admin)
                    </Button>
                  </Link>
                ) : eligibility?.eligible ? (
                  <Link href="/checkout">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-lg font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                ) : eligibility?.reason === 'APPROVAL_PENDING' ? (
                  <div className="space-y-3">
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-800">
                        Your account is pending admin approval. You can add items to cart but cannot complete purchases until approved.
                      </AlertDescription>
                    </Alert>
                    <Button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 rounded-xl text-lg font-semibold cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Checkout Locked - Approval Pending
                    </Button>
                    {user && (
                      <div className="text-sm text-gray-600 text-center">
                        <p>Account: {user.email}</p>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Approval Pending
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {eligibility?.message || 'Unable to proceed with checkout at this time.'}
                      </AlertDescription>
                    </Alert>
                    <Button
                      disabled
                      className="w-full bg-gray-400 text-white py-3 rounded-xl text-lg font-semibold cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Checkout Unavailable
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
