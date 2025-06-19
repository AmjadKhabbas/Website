import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical, Upload, Link2, Save, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductImageManagerProps {
  product: {
    id: number;
    name: string;
    imageUrl: string;
    imageUrls: string[] | null;
  };
  onUpdate: (productId: number, images: string[]) => void;
  isLoading?: boolean;
}

export function ProductImageManager({ product, onUpdate, isLoading = false }: ProductImageManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([
    product.imageUrl,
    ...(product.imageUrls || [])
  ].filter(Boolean));
  const [newImageUrl, setNewImageUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingFiles(true);
    const formData = new FormData();
    
    // Add all files to form data
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const newImageUrls = data.files.map((file: any) => file.imageUrl);
      
      setImages([...images, ...newImageUrls]);
      
      toast({
        title: "Upload successful",
        description: `${files.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleUploadDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files) {
      uploadFiles(files);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setImages(newImages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (images.length > 0) {
      const [mainImage, ...additionalImages] = images;
      onUpdate(product.id, images);
      setIsOpen(false);
    }
  };

  const resetChanges = () => {
    setImages([
      product.imageUrl,
      ...(product.imageUrls || [])
    ].filter(Boolean));
    setNewImageUrl('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetChanges();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Upload className="h-4 w-4 mr-1" />
          Images ({images.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Manage Images: {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Image</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      />
                    </div>
                    <Button onClick={addImage} disabled={!newImageUrl.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {newImageUrl && (
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleUploadDragOver}
                    onDrop={handleFileDrop}
                  >
                    {uploadingFiles ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 mx-auto text-blue-500 mb-4 animate-spin" />
                        <p className="text-sm text-gray-600">Uploading images...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop images here, or click to select files
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          Supports JPG, PNG, GIF, WebP (max 10MB each)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Files
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Current Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Current Images ({images.length})
                {images.length > 1 && (
                  <Badge variant="secondary" className="text-xs">
                    Drag to reorder
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No images added yet
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {images.map((imageUrl, index) => (
                      <motion.div
                        key={`${imageUrl}-${index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`relative group rounded-lg overflow-hidden border-2 ${
                          index === 0 ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className="cursor-move w-full h-full"
                        >
                            <div className="aspect-square bg-gray-100">
                              <img
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            {/* Image Controls */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeImage(index)}
                                disabled={images.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Primary Image Badge */}
                            {index === 0 && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-blue-500 text-white text-xs">
                                  Main
                                </Badge>
                              </div>
                            )}

                            {/* Image Index */}
                            <div className="absolute bottom-2 right-2">
                              <Badge variant="secondary" className="text-xs">
                                {index + 1}
                              </Badge>
                            </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={resetChanges}>
              Reset Changes
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={images.length === 0 || isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Images
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}