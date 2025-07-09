import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle, User, Mail, FileText, Building, MapPin, LogOut, Loader2, Package, Plus, Trash2, Edit, Search, Palette } from 'lucide-react';
import { AdvancedCarouselEditor } from '@/components/advanced-carousel-editor';
import { ProductImageManager } from '@/components/product-image-manager';
import { AdminNewsletterManagement } from '@/components/admin-newsletter-management';
import { Link } from 'wouter';
import { useToast } from '@/components/toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

interface PendingUser {
  id: number;
  email: string;
  fullName: string;
  licenseNumber: string;
  collegeName: string;
  provinceState: string;
  practiceName: string;
  practiceAddress: string;
  isApproved: boolean;
  isLicenseVerified: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  imageUrls: string[] | null;
  categoryId: number;
  inStock: boolean;
  featured: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface CarouselItem {
  id: number;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

function EditProductDialog({ product, categories, onClose }: { 
  product: Product; 
  categories: Category[];
  onClose: () => void; 
}) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    inStock: product.inStock,
    featured: product.featured
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('PUT', `/api/admin/products/${product.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      addToast('Product updated successfully', 'success');
      onClose();
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update product', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.categoryId.toString()} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="inStock"
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
              />
              <Label htmlFor="inStock">In Stock</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProductMutation.isPending}
              className="flex-1"
            >
              {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [, setLocation] = useLocation();
  const { isAdmin, admin, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pending users
  const { data: pendingUsers = [], isLoading, error } = useQuery<PendingUser[]>({
    queryKey: ['/api/admin/pending-users'],
    enabled: isAdmin === true
  });

  // Fetch all products for management with increased limit for admin view
  const { data: productsData, isLoading: productsLoading } = useQuery<{products: Product[]}>({
    queryKey: ['/api/products', { limit: 100 }], // Show up to 100 products for admin management
    queryFn: async () => {
      const response = await fetch('/api/products?limit=100');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    enabled: isAdmin === true
  });

  // Fetch categories for the edit form
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: isAdmin === true
  });

  // Fetch all orders for admin management
  const { data: adminOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/orders'],
    enabled: isAdmin === true
  });

  const products = productsData?.products || [];
  
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('POST', `/api/admin/approve-user/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      addToast('User approved successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to approve user', 'error');
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('DELETE', `/api/admin/reject-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      addToast('User rejected successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to reject user', 'error');
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('DELETE', `/api/admin/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      addToast('Product deleted successfully', 'success');
      setDeleteProductId(null);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete product', 'error');
    },
  });

  // Update product images mutation
  const updateProductImagesMutation = useMutation({
    mutationFn: async ({ productId, images }: { productId: number; images: string[] }) => {
      const [mainImage, ...additionalImages] = images;
      return await apiRequest('PATCH', `/api/admin/products/${productId}/images`, {
        imageUrl: mainImage,
        imageUrls: additionalImages
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      addToast('Product images updated successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update product images', 'error');
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, declineReason }: { orderId: number; status: string; declineReason?: string }) => {
      return await apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, {
        status,
        declineReason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      addToast('Order status updated successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update order status', 'error');
    },
  });

  if (!isAdmin) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage doctor registrations and products
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Doctor Registrations ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Management ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Management ({adminOrders.length})
            </TabsTrigger>
            <TabsTrigger value="carousel" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Carousel Management
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Newsletter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* Pending Users List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load pending registrations
                  </p>
                </CardContent>
              </Card>
            ) : pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No pending registrations found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pendingUsers.map((user) => (
                  <Card key={user.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            {user.fullName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Pending Approval
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">License:</span>
                            <span className="text-sm text-gray-600">{user.licenseNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">College:</span>
                            <span className="text-sm text-gray-600">{user.collegeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Province:</span>
                            <span className="text-sm text-gray-600">{user.provinceState}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Practice:</span>
                            <span className="text-sm text-gray-600">{user.practiceName}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <span className="text-sm font-medium">Address:</span>
                              <p className="text-sm text-gray-600">{user.practiceAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => rejectMutation.mutate(user.id)}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => approveMutation.mutate(user.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            {/* Order Management */}
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : adminOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    No orders found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order Management
                  </h2>
                  <Badge variant="outline">
                    {adminOrders.length} Total Orders
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {adminOrders.map((order: any) => (
                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {/* Order Header */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Order #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${order.totalAmount}
                              </p>
                              <Badge variant={
                                order.status === 'pending' ? 'secondary' :
                                order.status === 'approved' ? 'default' :
                                order.status === 'declined' ? 'destructive' : 'outline'
                              }>
                                {order.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Doctor Information */}
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Doctor Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Name:</span> {order.doctorName}
                              </div>
                              <div>
                                <span className="font-medium">Email:</span> {order.doctorEmail}
                              </div>
                              {order.doctorPhone && (
                                <div>
                                  <span className="font-medium">Phone:</span> {order.doctorPhone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Information (Admin Only) */}
                          {order.cardInfo && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                Payment Information (Admin View)
                              </h4>
                              <div className="grid grid-cols-1 gap-2 text-sm text-red-800 dark:text-red-200">
                                <div>
                                  <span className="font-medium">Card:</span> {order.cardInfo.cardNumber || `****${order.cardInfo.last4}`}
                                </div>
                                <div>
                                  <span className="font-medium">Cardholder:</span> {order.cardInfo.cardholderName || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">CVC:</span> {order.cardInfo.cvv || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">Expires:</span> {order.cardInfo.expiryMonth?.padStart(2, '0')}/{order.cardInfo.expiryYear}
                                </div>
                                <div>
                                  <span className="font-medium">Card Type:</span> {order.cardInfo.cardType || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">Bank:</span> {order.doctorBankingInfo?.bankName || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">Account Type:</span> {order.doctorBankingInfo?.accountType || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">Account Number:</span> {order.doctorBankingInfo?.accountNumber || 'Not provided'}
                                </div>
                                <div>
                                  <span className="font-medium">Routing Number:</span> {order.doctorBankingInfo?.routingNumber || 'Not provided'}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Shipping Address */}
                          {order.shippingAddress && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Shipping Address
                              </h4>
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                <div>{order.shippingAddress.street}</div>
                                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                                <div>{order.shippingAddress.country}</div>
                              </div>
                            </div>
                          )}

                          {/* Billing Address */}
                          {order.billingAddress && (
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                Billing Address
                              </h4>
                              <div className="text-sm text-green-800 dark:text-green-200">
                                <div>{order.billingAddress.street}</div>
                                <div>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</div>
                                <div>{order.billingAddress.country}</div>
                              </div>
                            </div>
                          )}

                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Order Items ({order.items?.length || 0})
                            </h4>
                            <div className="space-y-2">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                  <div>
                                    <span className="font-medium">{item.productName}</span>
                                    <span className="text-gray-600 dark:text-gray-400 ml-2">x{item.quantity}</span>
                                  </div>
                                  <span className="font-medium">${item.totalPrice}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatusMutation.mutate({ 
                                    orderId: order.id, 
                                    status: 'approved' 
                                  })}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => updateOrderStatusMutation.mutate({ 
                                    orderId: order.id, 
                                    status: 'declined',
                                    declineReason: 'Declined by admin'
                                  })}
                                  disabled={updateOrderStatusMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}
                            {order.status === 'approved' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateOrderStatusMutation.mutate({ 
                                  orderId: order.id, 
                                  status: 'shipped' 
                                })}
                                disabled={updateOrderStatusMutation.isPending}
                              >
                                Ship Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            {/* Product Management */}
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Link href="/admin/products">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </Link>
                </div>

                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm ? 'No products found matching your search' : 'No products found'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div>
                                <h4 className="font-semibold text-lg">{product.name}</h4>
                                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="font-semibold text-green-600">${product.price}</span>
                                  <Badge variant={product.inStock ? "default" : "secondary"}>
                                    {product.inStock ? "In Stock" : "Out of Stock"}
                                  </Badge>
                                  <Badge variant="outline">{product.category?.name || 'Unknown Category'}</Badge>
                                  {product.featured && <Badge variant="destructive">Featured</Badge>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <ProductImageManager
                                product={product}
                                onUpdate={(productId, images) => 
                                  updateProductImagesMutation.mutate({ productId, images })
                                }
                                isLoading={updateProductImagesMutation.isPending}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteProductId(product.id)}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselManagement />
          </TabsContent>

          <TabsContent value="newsletter">
            <AdminNewsletterManagement />
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <EditProductDialog
            product={editingProduct}
            categories={categories}
            onClose={() => setEditingProduct(null)}
          />
        )}

        {/* Delete Product Confirmation Dialog */}
        <Dialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteProductId(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteProductId && deleteProductMutation.mutate(deleteProductId)}
                  disabled={deleteProductMutation.isPending}
                  className="flex-1"
                >
                  {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Carousel Management Component
const CarouselManagement = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch carousel items
  const { data: carouselItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/carousel'],
    queryFn: async () => {
      const response = await fetch('/api/carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      return response.json();
    },
  });

  // Create carousel item mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<CarouselItem>) => {
      return await apiRequest('POST', '/api/carousel', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      addToast('Carousel item created successfully', 'success');
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to create carousel item', 'error');
    },
  });

  // Update carousel item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<CarouselItem> }) => {
      return await apiRequest('PATCH', `/api/carousel/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      addToast('Carousel item updated successfully', 'success');
      setEditingItem(null);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to update carousel item', 'error');
    },
  });

  // Delete carousel item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/carousel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      addToast('Carousel item deleted successfully', 'success');
      setDeleteItemId(null);
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to delete carousel item', 'error');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Carousel Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage the rotating hero section content
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Carousel Item
        </Button>
      </div>

      {itemsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : carouselItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No carousel items found. Create your first item to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {carouselItems.map((item: CarouselItem) => (
            <Card key={item.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 flex-1">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-green-600">
                          ${item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-gray-500 line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                        {item.discount && (
                          <Badge variant="destructive">
                            {item.discount} off
                          </Badge>
                        )}
                      </div>
                      
                      {item.ctaText && (
                        <div className="text-sm text-blue-600">
                          CTA: "{item.ctaText}"
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteItemId(item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Advanced Carousel Editor */}
      <AdvancedCarouselEditor
        open={createDialogOpen || editingItem !== null}
        onClose={() => {
          setCreateDialogOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(data) => {
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
        mode={editingItem ? 'edit' : 'create'}
        item={editingItem || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteItemId !== null} onOpenChange={() => setDeleteItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Carousel Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this carousel item? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteItemId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteItemId && deleteMutation.mutate(deleteItemId)}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Create Carousel Dialog Component
const CreateCarouselDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CarouselItem>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    discountPercentage: '',
    imageUrl: '',
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    ctaText: 'Shop Now',
    ctaLink: '',
    ctaButtonColor: '#10b981',
    badgeText: '',
    badgeColor: '#ef4444',
    animationType: 'fade',
    displayDuration: 5000,
    isActive: true,
    sortOrder: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Carousel Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                placeholder="e.g., 25%"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageFile" className="text-sm">Upload Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl" className="text-sm">Or Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                type="url"
                value={formData.ctaLink}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Carousel Dialog Component  
const EditCarouselDialog = ({
  item,
  onClose,
  onSubmit,
  isLoading
}: {
  item: CarouselItem;
  onClose: () => void;
  onSubmit: (data: Partial<CarouselItem>) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    price: item.price,
    originalPrice: item.originalPrice || '',
    discount: item.discount || '',
    imageUrl: item.imageUrl,
    ctaText: item.ctaText || 'Shop Now',
    ctaLink: item.ctaLink || '',
    isActive: item.isActive,
    sortOrder: item.sortOrder
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Carousel Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                placeholder="e.g., 25%"
                value={formData.discount}
                onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageFile" className="text-sm">Upload Image</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl" className="text-sm">Or Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                value={formData.ctaText}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                type="url"
                value={formData.ctaLink}
                onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Updating...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};