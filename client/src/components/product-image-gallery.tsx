import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  hasDiscount?: boolean;
  discountPercentage?: number;
  className?: string;
}

export function ProductImageGallery({ 
  images, 
  productName, 
  hasDiscount, 
  discountPercentage,
  className = ""
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Ensure we have at least one image
  const allImages = images.length > 0 ? images : [images[0] || '/placeholder-product.jpg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative group">
        <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 relative">
          <motion.img
            key={currentImageIndex}
            src={allImages[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsZoomed(true)}
          />
          
          {/* Discount Badge */}
          {hasDiscount && discountPercentage && (
            <div className="absolute top-6 left-6">
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-lg px-3 py-1">
                -{discountPercentage}%
              </Badge>
            </div>
          )}

          {/* Navigation Arrows - Only show if multiple images */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-10 w-10"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-10 w-10"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-10 w-10"
            onClick={() => setIsZoomed(true)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip - Only show if multiple images */}
      {allImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-500/50'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={allImages[currentImageIndex]}
                alt={`${productName} - Fullscreen`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 h-10 w-10"
                onClick={() => setIsZoomed(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Navigation in Fullscreen */}
              {allImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 h-12 w-12"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 h-12 w-12"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Image Counter in Fullscreen */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                    {currentImageIndex + 1} of {allImages.length}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}