import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, Package, Settings, LogOut, Edit, Save, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User, ProductWithCategory } from '@shared/schema';
import { useLocation } from 'wouter';

/**
 * Admin Dashboard for Managing Medical Marketplace
 * Features:
 * - Product price and image editing
 * - Doctor registration approval/rejection
 * - System overview and statistics
 * - Secure admin logout
 */

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { admin, logoutMutation } = useAdmin();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState('');
  const [editingImage, setEditingImage] = useState('');

  // Fetch products for admin management
  const { data: productsData } = useQuery({
    queryKey: ['/api/products'],
  });
  const products = productsData?.products || [];

  // Fetch pending user registrations
  const { data: pendingUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/pending-users'],
    enabled: !!admin,
  });

  // Product update mutations
  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, price }: { productId: number; price: string }) => {
      await apiRequest('PUT', `/api/admin/products/${productId}/price`, { price });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      toast({
        title: "Price updated successfully",
        description: "Product price has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update product price.",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      await apiRequest('PUT', `/api/admin/products/${productId}/image`, { imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      toast({
        title: "Image updated successfully",
        description: "Product image has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update product image.",
        variant: "destructive",
      });
    },
  });

  // User approval mutations
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('PUT', `/api/admin/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      toast({
        title: "User approved",
        description: "Doctor registration has been approved.",
      });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest('DELETE', `/api/admin/users/${userId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      toast({
        title: "User rejected",
        description: "Doctor registration has been rejected.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/');
      },
    });
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    setEditingProduct(product.id);
    setEditingPrice(product.price);
    setEditingImage(product.imageUrl);
  };

  const handleSavePrice = () => {
    if (editingProduct) {
      updatePriceMutation.mutate({ 
        productId: editingProduct, 
        price: editingPrice 
      });
    }
  };

  const handleSaveImage = () => {
    if (editingProduct) {
      updateImageMutation.mutate({ 
        productId: editingProduct, 
        imageUrl: editingImage 
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditingPrice('');
    setEditingImage('');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as an admin to access this page.</p>
          <Button onClick={() => setLocation('/admin/login')} className="mt-4">
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {admin.name}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'users', label: 'User Approvals', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-3 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                {id === 'users' && pendingUsers.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingUsers.length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
                <p className="text-sm text-gray-600">Edit product prices and images</p>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  {products.map((product: ProductWithCategory) => (
                    <div key={product.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category?.name}</p>
                          {editingProduct === product.id ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  placeholder="Price"
                                  className="w-24"
                                />
                                <Button size="sm" onClick={handleSavePrice}>
                                  <Save className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Input
                                  value={editingImage}
                                  onChange={(e) => setEditingImage(e.target.value)}
                                  placeholder="Image URL"
                                  className="w-64"
                                />
                                <Button size="sm" onClick={handleSaveImage}>
                                  <Save className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-teal-600">${product.price}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {editingProduct === product.id ? (
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Pending User Approvals</h2>
                <p className="text-sm text-gray-600">Review and approve doctor registrations</p>
              </div>
              <div className="p-6">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending user approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-900">{user.fullName}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">License:</span> {user.licenseNumber}
                              </div>
                              <div>
                                <span className="font-medium">College:</span> {user.collegeName}
                              </div>
                              <div>
                                <span className="font-medium">Practice:</span> {user.practiceName}
                              </div>
                              <div>
                                <span className="font-medium">Province/State:</span> {user.provinceState}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Address:</span> {user.practiceAddress}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveUserMutation.mutate(user.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectUserMutation.mutate(user.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
                <p className="text-sm text-gray-600">Admin configuration and system information</p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Admin Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p><span className="font-medium">Email:</span> {admin.email}</p>
                      <p><span className="font-medium">Role:</span> {admin.role}</p>
                      <p><span className="font-medium">Status:</span> Active</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-teal-600">{products.length}</p>
                        <p className="text-sm text-gray-600">Total Products</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-2xl font-bold text-orange-600">{pendingUsers.length}</p>
                        <p className="text-sm text-gray-600">Pending Approvals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}