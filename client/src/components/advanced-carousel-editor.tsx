import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CarouselItem, Product } from '@shared/schema';

interface AdvancedCarouselEditorProps {
  item?: CarouselItem;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CarouselItem>) => void;
  isLoading: boolean;
  mode: 'create' | 'edit';
}

export const AdvancedCarouselEditor = ({
  item,
  open,
  onClose,
  onSubmit,
  isLoading,
  mode
}: AdvancedCarouselEditorProps) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    subtitle: item?.subtitle || '',
    description: item?.description || '',
    price: item?.price || '',
    originalPrice: item?.originalPrice || '',
    discount: item?.discount || '',
    discountPercentage: item?.discountPercentage || 0,
    imageUrl: item?.imageUrl || '',
    backgroundGradient: item?.backgroundGradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: item?.textColor || '#ffffff',
    ctaText: item?.ctaText || 'Shop Now',
    ctaLink: item?.ctaLink || '',
    linkedProductId: item?.linkedProductId || null,
    ctaButtonColor: item?.ctaButtonColor || '#10b981',
    badgeText: item?.badgeText || '',
    badgeColor: item?.badgeColor || '#ef4444',
    animationType: item?.animationType || 'fade',
    displayDuration: item?.displayDuration || 5000,
    isActive: item?.isActive ?? true,
    sortOrder: item?.sortOrder || 0
  });

  // Fetch available products for linking
  const { data: productsResponse } = useQuery<{ products: Product[] }>({
    queryKey: ['/api/products'],
  });
  const products = productsResponse?.products || [];

  const [previewMode, setPreviewMode] = useState(false);

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

  const gradientPresets = [
    { name: 'Blue Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Ocean', value: 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)' },
    { name: 'Sunset', value: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
    { name: 'Green Mint', value: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' },
    { name: 'Medical Blue', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Purple Pink', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Carousel Item' : 'Edit Carousel Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Main Form */}
          <div className="flex-1">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                <TabsContent value="content" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content & Text</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Main Title *</Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Premium Botox Treatment"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subtitle">Subtitle</Label>
                          <Input
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                            placeholder="Professional Grade"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Professional grade botulinum toxin for cosmetic procedures"
                          required
                          rows={3}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="linkedProduct">Link to Product</Label>
                          <Select
                            value={formData.linkedProductId?.toString() || ""}
                            onValueChange={(value) => setFormData(prev => ({ 
                              ...prev, 
                              linkedProductId: value ? parseInt(value) : null,
                              ctaLink: value ? `/product/${value}` : ''
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product to link (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No product link</SelectItem>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ctaText">Button Text</Label>
                            <Input
                              id="ctaText"
                              value={formData.ctaText}
                              onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                              placeholder="Shop Now"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="ctaLink">Custom Link (if not using product link)</Label>
                            <Input
                              id="ctaLink"
                              value={formData.ctaLink}
                              onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                              placeholder="/products or https://example.com"
                              disabled={!!formData.linkedProductId}
                            />
                          </div>
                        </div>
                      </div>
                          <Label htmlFor="ctaLink">Button Link</Label>
                          <Input
                            id="ctaLink"
                            value={formData.ctaLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                            placeholder="/products"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="badgeText">Promotional Badge</Label>
                        <Input
                          id="badgeText"
                          value={formData.badgeText}
                          onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                          placeholder="Sale!, New!, Limited Time!"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                          onChange={(e) => setFormData(prev => ({ ...prev, badgeText: e.target.value }))}
                          placeholder="Limited Time"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price">Current Price *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="699.99"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="originalPrice">Original Price</Label>
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                            placeholder="899.99"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discountPercentage">Discount %</Label>
                          <Input
                            id="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discountPercentage}
                            onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: parseInt(e.target.value) || 0 }))}
                            placeholder="22"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount Text</Label>
                        <Input
                          id="discount"
                          value={formData.discount}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                          placeholder="Save 22%"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visual Design</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Background Gradient</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {gradientPresets.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              className={`p-3 rounded-lg border text-white text-sm ${
                                formData.backgroundGradient === preset.value 
                                  ? 'border-blue-500 ring-2 ring-blue-200' 
                                  : 'border-gray-300'
                              }`}
                              style={{ background: preset.value }}
                              onClick={() => setFormData(prev => ({ ...prev, backgroundGradient: preset.value }))}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                        <Input
                          value={formData.backgroundGradient}
                          onChange={(e) => setFormData(prev => ({ ...prev, backgroundGradient: e.target.value }))}
                          placeholder="Custom gradient CSS"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="textColor">Text Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="textColor"
                              type="color"
                              value={formData.textColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={formData.textColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                              placeholder="#ffffff"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ctaButtonColor">Button Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="ctaButtonColor"
                              type="color"
                              value={formData.ctaButtonColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, ctaButtonColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={formData.ctaButtonColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, ctaButtonColor: e.target.value }))}
                              placeholder="#10b981"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="badgeColor">Badge Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="badgeColor"
                              type="color"
                              value={formData.badgeColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, badgeColor: e.target.value }))}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={formData.badgeColor}
                              onChange={(e) => setFormData(prev => ({ ...prev, badgeColor: e.target.value }))}
                              placeholder="#ef4444"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Animation & Timing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="animationType">Animation Type</Label>
                          <Select
                            value={formData.animationType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, animationType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select animation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fade">Fade</SelectItem>
                              <SelectItem value="slide">Slide</SelectItem>
                              <SelectItem value="zoom">Zoom</SelectItem>
                              <SelectItem value="none">No Animation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="displayDuration">Display Duration (ms)</Label>
                          <Input
                            id="displayDuration"
                            type="number"
                            min="1000"
                            max="10000"
                            step="500"
                            value={formData.displayDuration}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayDuration: parseInt(e.target.value) }))}
                            placeholder="5000"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sortOrder">Display Order</Label>
                          <Input
                            id="sortOrder"
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                          />
                          <Label htmlFor="isActive">Active</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Update Item'}
                  </Button>
                </div>
              </form>
            </Tabs>
          </div>

          {/* Live Preview */}
          <div className="w-80">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative h-48 rounded-lg overflow-hidden text-white p-6 flex flex-col justify-between"
                  style={{ 
                    background: formData.backgroundGradient,
                    color: formData.textColor 
                  }}
                >
                  {formData.badgeText && (
                    <Badge 
                      className="absolute top-2 left-2 text-white"
                      style={{ backgroundColor: formData.badgeColor }}
                    >
                      {formData.badgeText}
                    </Badge>
                  )}
                  
                  <div>
                    {formData.subtitle && (
                      <p className="text-sm opacity-90 mb-1">{formData.subtitle}</p>
                    )}
                    <h3 className="text-lg font-bold mb-2">{formData.title || 'Title'}</h3>
                    <p className="text-sm opacity-80 line-clamp-2">
                      {formData.description || 'Description'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold">${formData.price || '0.00'}</span>
                      {formData.originalPrice && (
                        <span className="text-sm line-through opacity-60 ml-2">
                          ${formData.originalPrice}
                        </span>
                      )}
                      {formData.discount && (
                        <div className="text-xs mt-1">{formData.discount}</div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: formData.ctaButtonColor }}
                      className="text-white"
                    >
                      {formData.ctaText || 'Shop Now'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};