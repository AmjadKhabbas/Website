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
import { CheckCircle, XCircle, User, Mail, FileText, Building, MapPin, LogOut, Loader2, Package, Plus, Trash2, Edit, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
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
  categoryId: number;
  inStock: boolean;
  featured: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  imageUrl?: string;
  itemCount: number;
}

function CategoryForm({ category, onSuccess }: { 
  category?: Category; 
  onSuccess: () => void; 
}) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '📦',
    color: category?.color || 'blue',
    imageUrl: category?.imageUrl || ''
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';
      return await apiRequest(method, endpoint, data);
    },
    onSuccess: () => {
      addToast(category ? 'Category updated successfully' : 'Category created successfully', 'success');
      onSuccess();
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to save category', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }
    
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    createCategoryMutation.mutate({
      ...formData,
      slug
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Botulinum Toxins"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the category"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
            placeholder="📦"
          />
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="teal">Teal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={createCategoryMutation.isPending}
        className="w-full"
      >
        {createCategoryMutation.isPending ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
      </Button>
    </form>
  );
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
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // Fetch pending users
  const { data: pendingUsers = [], isLoading, error } = useQuery<PendingUser[]>({
    queryKey: ['/api/admin/pending-users'],
    enabled: isAdmin === true
  });

  // Fetch all products for management
  const { data: productsData, isLoading: productsLoading } = useQuery<{products: Product[]}>({
    queryKey: ['/api/products'],
    enabled: isAdmin === true
  });

  // Fetch categories for the edit form
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Doctor Registrations ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Management ({products.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Category Management ({categories.length})
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
                                  <Badge variant="outline">{product.category.name}</Badge>
                                  {product.featured && <Badge variant="destructive">Featured</Badge>}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
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

          <TabsContent value="categories">
            <div className="space-y-6">
              {/* Category Management Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Category Management</h2>
                  <p className="text-gray-600">Manage product categories and their images</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/categories'] })} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Categories Grid */}
              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No categories found</p>
                    <p className="text-sm text-gray-500 mt-2">Create your first category to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <Card key={category.id} className="relative group">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          {/* Category Image */}
                          <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {category.imageUrl ? (
                              <img 
                                src={category.imageUrl} 
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building className="h-8 w-8 text-blue-600" />
                            )}
                          </div>
                          
                          {/* Category Info */}
                          <div>
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            <p className="text-sm text-gray-500">/{category.slug}</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Category</DialogTitle>
                                </DialogHeader>
                                <CategoryForm 
                                  category={category} 
                                  onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/categories'] })} 
                                />
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setCategoryToDelete(category.id)}
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