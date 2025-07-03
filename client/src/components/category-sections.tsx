import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import type { Category } from '@shared/schema';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategorySectionsProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function CategorySections({ 
  searchQuery = '', 
  onSearchChange,
  className = "" 
}: CategorySectionsProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { success, error } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
      color: 'blue',
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        }),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setShowAddDialog(false);
      form.reset();
    },
    onError: () => {
      error('Failed to create category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        }),
      });
    },
    onSuccess: () => {
      success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
      form.reset();
    },
    onError: () => {
      error('Failed to update category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: () => {
      error('Failed to delete category');
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data });
    } else {
      await createCategoryMutation.mutateAsync(data);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategoryMutation.mutateAsync(id);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 pr-4 py-3 rounded-full border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button 
          className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-6 py-2 bg-blue-500 hover:bg-blue-600"
          onClick={() => onSearchChange?.(searchQuery)}
        >
          Search
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-3 px-4">
        {categories.map((category) => (
          <div key={category.id} className="relative group">
            <Link href={`/products?category=${category.slug}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
              >
                <Badge
                  variant="secondary"
                  className={`px-6 py-3 text-sm font-medium rounded-full transition-all duration-200 hover:shadow-md
                    ${category.color === 'blue' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                    ${category.color === 'green' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                    ${category.color === 'purple' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : ''}
                    ${category.color === 'orange' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : ''}
                    ${category.color === 'red' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                    ${category.color === 'gray' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : ''}
                  `}
                >
                  {category.name}
                  {category.itemCount > 0 && (
                    <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {category.itemCount}
                    </span>
                  )}
                </Badge>
              </motion.div>
            </Link>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-blue-50"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 bg-white shadow-sm hover:bg-red-50"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Add Category Button (Admin Only) */}
        {isAdmin && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="px-6 py-3 rounded-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Botulinum Toxins" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Category description..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., syringe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Theme</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full p-2 border rounded-md">
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="purple">Purple</option>
                            <option value="orange">Orange</option>
                            <option value="red">Red</option>
                            <option value="gray">Gray</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCategoryMutation.isPending}
                    >
                      {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Botulinum Toxins" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Category description..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., syringe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Theme</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded-md">
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                        <option value="gray">Gray</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateCategoryMutation.isPending}
                >
                  {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}