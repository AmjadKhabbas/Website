import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Image, Link as LinkIcon, Tag, Upload, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface CarouselItem {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  price?: string;
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

interface CarouselFormData {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  originalPrice: string;
  discount: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

function CarouselItemForm({ 
  item, 
  onClose, 
  onSave 
}: { 
  item?: CarouselItem; 
  onClose: () => void; 
  onSave: (data: CarouselFormData) => void; 
}) {
  const [formData, setFormData] = useState<CarouselFormData>({
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    price: item?.price || '',
    originalPrice: item?.originalPrice || '',
    discount: item?.discount || '',
    imageUrl: item?.imageUrl || '',
    ctaText: item?.ctaText || 'Shop Now',
    ctaLink: item?.ctaLink || '',
    isActive: item?.isActive !== undefined ? item.isActive : true
  });

  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    try {
      // In a real implementation, upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({ ...prev, imageUrl }));
        setImageUploadLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setImageUploadLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Carousel Image</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {formData.imageUrl ? (
            <div className="relative">
              <img 
                src={formData.imageUrl} 
                alt="Carousel preview" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="carousel-image-upload"
                disabled={imageUploadLoading}
              />
              <label
                htmlFor="carousel-image-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {imageUploadLoading ? "Uploading..." : "Click to upload carousel image"}
                </p>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
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

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Sale Price</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="$189.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="originalPrice">Original Price</Label>
          <Input
            id="originalPrice"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
            placeholder="$249.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discount">Discount Label</Label>
          <Input
            id="discount"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
            placeholder="24% OFF"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ctaText">Button Text</Label>
          <Input
            id="ctaText"
            value={formData.ctaText}
            onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ctaLink">Shop Now URL</Label>
          <Input
            id="ctaLink"
            value={formData.ctaLink}
            onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
            placeholder="/product/123 or https://example.com"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {item ? 'Update' : 'Create'} Banner
        </Button>
      </div>
    </form>
  );
}

export function AdminCarouselManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch carousel items
  const { data: carouselItems = [], isLoading } = useQuery<CarouselItem[]>({
    queryKey: ['/api/carousel'],
  });

  // Create carousel item mutation
  const createMutation = useMutation({
    mutationFn: async (data: CarouselFormData) => {
      return await apiRequest('POST', '/api/carousel', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      toast({
        title: "Banner created",
        description: "Carousel banner has been created successfully.",
      });
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update carousel item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CarouselFormData }) => {
      return await apiRequest('PUT', `/api/carousel/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      toast({
        title: "Banner updated",
        description: "Carousel banner has been updated successfully.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete carousel item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/carousel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      toast({
        title: "Banner deleted",
        description: "Carousel banner has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: CarouselFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Carousel Management</h3>
          <p className="text-sm text-gray-600">Manage front-page carousel banners with custom links</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Carousel Banner</DialogTitle>
            </DialogHeader>
            <CarouselItemForm
              onClose={() => setShowCreateDialog(false)}
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Carousel Items */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading carousel items...</p>
        </div>
      ) : carouselItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No carousel banners created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Banner
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {carouselItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${item.isActive ? 'border-green-200' : 'border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Preview Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-32 h-20 object-cover rounded-lg"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {item.isActive ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {item.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{item.subtitle}</p>
                        )}
                        
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            {item.price && (
                              <span className="font-semibold text-green-600">{item.price}</span>
                            )}
                            {item.discount && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {item.discount}
                              </span>
                            )}
                            {item.ctaLink && (
                              <span className="text-blue-600 flex items-center gap-1">
                                <LinkIcon className="h-3 w-3" />
                                {item.ctaText || 'Shop Now'}
                              </span>
                            )}
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
                              onClick={() => {
                                if (window.confirm('Delete this carousel banner?')) {
                                  deleteMutation.mutate(item.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Carousel Banner</DialogTitle>
            </DialogHeader>
            <CarouselItemForm
              item={editingItem}
              onClose={() => setEditingItem(null)}
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}