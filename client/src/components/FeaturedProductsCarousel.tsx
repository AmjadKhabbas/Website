import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FeaturedProduct {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl: string;
    rating: string;
    reviewCount: number;
  };
  displayOrder: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
}

export default function FeaturedProductsCarousel() {
  const [isManaging, setIsManaging] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch featured products
  const { data: featuredProducts = [] } = useQuery<FeaturedProduct[]>({
    queryKey: ['/api/featured-carousel'],
  });

  // Fetch all products for admin selection
  const { data: allProductsResponse } = useQuery<{ products: Product[] }>({
    queryKey: ['/api/products'],
    enabled: isAdmin && isManaging,
  });
  const allProducts = allProductsResponse?.products || [];

  // Add product to carousel mutation
  const addProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest('POST', '/api/admin/featured-carousel', {
        productId,
        displayOrder: featuredProducts.length
      });
    },
    onSuccess: () => {
      toast({ title: 'Product added to carousel successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/featured-carousel'] });
      setSelectedProductId('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Remove product from carousel mutation
  const removeProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/featured-carousel/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Product removed from carousel successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/featured-carousel'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to remove product', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 3));
    }, 4000); // Auto-scroll every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredProducts.length]);

  // Pause auto-scroll on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Manual navigation
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 3));
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(featuredProducts.length / 3)) % Math.ceil(featuredProducts.length / 3));
  };

  const handleAddProduct = () => {
    if (selectedProductId) {
      addProductMutation.mutate(parseInt(selectedProductId));
    }
  };

  if (featuredProducts.length === 0) {
    if (isAdmin) {
      return (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-800 mb-6">FEATURED PRODUCTS</h2>
              <p className="text-xl text-slate-600 mb-8">No featured products yet. Add some to display here.</p>
              <Dialog open={isManaging} onOpenChange={setIsManaging}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Featured Products
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Product to Carousel</DialogTitle>
                    <DialogDescription>
                      Select a product to feature in the carousel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {allProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddProduct}
                        disabled={!selectedProductId || addProductMutation.isPending}
                        className="flex-1"
                      >
                        Add Product
                      </Button>
                      <Button variant="outline" onClick={() => setIsManaging(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>
      );
    }
    return null; // Don't show anything if no products and not admin
  }

  const itemsPerView = 3;
  const totalSlides = Math.ceil(featuredProducts.length / itemsPerView);
  const visibleProducts = featuredProducts.slice(
    currentIndex * itemsPerView,
    (currentIndex + 1) * itemsPerView
  );

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <h2 className="text-4xl font-bold text-slate-800">FEATURED PRODUCTS</h2>
            {isAdmin && (
              <Dialog open={isManaging} onOpenChange={setIsManaging}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Manage Featured Products</DialogTitle>
                    <DialogDescription>
                      Add or remove products from the featured carousel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Current featured products */}
                    <div>
                      <h3 className="font-medium mb-2">Current Featured Products</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {featuredProducts.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{item.product.name}</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeProductMutation.mutate(item.id)}
                              disabled={removeProductMutation.isPending}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add new product */}
                    <div>
                      <h3 className="font-medium mb-2">Add New Product</h3>
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {allProducts
                            .filter(product => !featuredProducts.some(fp => fp.product.id === product.id))
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={handleAddProduct}
                        disabled={!selectedProductId || addProductMutation.isPending}
                        className="w-full mt-2"
                      >
                        Add Product
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <p className="text-xl text-slate-600">Discover our premium selection of top-quality medical products</p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {Array.from({ length: totalSlides }, (_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredProducts
                    .slice(slideIndex * itemsPerView, (slideIndex + 1) * itemsPerView)
                    .map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white border-0 shadow-lg hover:scale-105">
                          <CardContent className="p-6">
                            <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=400&fit=crop';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="text-center">
                              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                {item.product.name}
                              </h3>
                              <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                                {item.product.description}
                              </p>
                              
                              <div className="text-2xl font-bold text-blue-600">
                                ${item.product.price}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-3 z-10"
                onClick={goToPrev}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-full p-3 z-10"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalSlides }, (_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}