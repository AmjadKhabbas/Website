import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, X, Upload, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

interface AdminCarouselEditorProps {
  items: CarouselItem[];
}

export function AdminCarouselEditor({ items }: AdminCarouselEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CarouselItem> }) => {
      await apiRequest('PATCH', `/api/admin/carousel/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/carousel'] });
      toast({ title: "Carousel updated successfully" });
      setEditingId(null);
      setEditingItem(null);
    },
    onError: () => {
      toast({ 
        title: "Update failed", 
        description: "Failed to update carousel item",
        variant: "destructive" 
      });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      if (editingItem) {
        setEditingItem({ ...editingItem, imageUrl: data.imageUrl });
      }
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ 
        title: "Upload failed", 
        description: "Failed to upload image",
        variant: "destructive" 
      });
    }
  });

  const startEditing = (item: CarouselItem) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  const saveEdit = () => {
    if (!editingItem) return;
    
    updateMutation.mutate({
      id: editingItem.id,
      data: {
        title: editingItem.title,
        subtitle: editingItem.subtitle,
        description: editingItem.description,
        imageUrl: editingItem.imageUrl,
        isActive: editingItem.isActive
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingItem(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const toggleActive = (item: CarouselItem) => {
    updateMutation.mutate({
      id: item.id,
      data: { isActive: !item.isActive }
    });
  };

  if (previewMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Carousel Preview</h3>
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(false)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit Mode
          </Button>
        </div>
        
        {/* Carousel Preview */}
        <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600">
          {items.filter(item => item.isActive).map((item, index) => (
            <div key={item.id} className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center space-y-4 p-8">
                <h2 className="text-4xl font-bold">{item.title}</h2>
                <p className="text-xl">{item.subtitle}</p>
                <p className="text-lg opacity-90">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Carousel Management</h3>
          <p className="text-sm text-gray-600">Edit carousel items - "Shop Now" button is hidden for admin users</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setPreviewMode(true)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </div>

      <div className="grid gap-6">
        {items.map((item) => (
          <Card key={item.id} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">
                Slide {item.sortOrder}: {item.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(item)}
                  disabled={updateMutation.isPending}
                >
                  {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {editingId === item.id ? (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveEdit}
                      disabled={updateMutation.isPending}
                      className="text-green-600 border-green-300"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEdit}
                      className="text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditing(item)}
                    className="text-blue-600 border-blue-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {editingId === item.id && editingItem ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={editingItem.title}
                          onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                          placeholder="Carousel title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input
                          id="subtitle"
                          value={editingItem.subtitle}
                          onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                          placeholder="Carousel subtitle"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          placeholder="Carousel description"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="image">Image</Label>
                        <div className="flex gap-2">
                          <Input
                            id="image"
                            value={editingItem.imageUrl}
                            onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                            placeholder="Image URL"
                          />
                          <div>
                            <input
                              type="file"
                              id="file-upload"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('file-upload')?.click()}
                              disabled={uploadMutation.isPending}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {editingItem.imageUrl && (
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={editingItem.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {uploadMutation.isPending && (
                    <Alert>
                      <AlertDescription>Uploading image...</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subtitle:</span>
                      <p className="text-sm">{item.subtitle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  </div>
                  
                  {item.imageUrl && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Current Image:</span>
                      <div className="mt-1 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}