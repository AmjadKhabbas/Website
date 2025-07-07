import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Laptop, Shirt, Home, Dumbbell, Book, Heart, Star, ChevronLeft, ChevronRight, Loader2, Edit3, Upload, Save, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewsletterSubscription } from '@/components/newsletter-subscription';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/toast';
import type { Category, ProductWithCategory, Brand } from '@shared/schema';

// Hero Slideshow Component - Full Section Slideshow
const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Fetch carousel items from the database
  const { data: carouselItems = [], isLoading } = useQuery({
    queryKey: ['/api/carousel'],
    queryFn: async () => {
      const response = await fetch('/api/carousel');
      if (!response.ok) throw new Error('Failed to fetch carousel items');
      return response.json();
    },
  });

  // Fallback to default items if database is empty
  const defaultItems = [
    {
      id: 1,
      title: "Premium Botox Treatment",
      description: "Professional grade botulinum toxin for cosmetic procedures",
      price: "699.99",
      originalPrice: "899.99",
      discount: "22%",
      imageUrl: "/api/placeholder/400/300",
      onSale: true,
      isActive: true,
      sortOrder: 0
    },
    {
      id: 2,
      title: "Dermal Filler Kit",
      description: "Complete hyaluronic acid filler collection",
      price: "549.99",
      originalPrice: "749.99",
      discount: "27%",
      imageUrl: "/api/placeholder/400/300",
      onSale: false,
      isActive: true,
      sortOrder: 1
    },
    {
      id: 3,
      title: "Medical Equipment Set",
      description: "Professional injection and treatment tools",
      price: "899.99",
      originalPrice: "1199.99",
      discount: "25%",
      imageUrl: "/api/placeholder/400/300",
      onSale: true,
      isActive: true,
      sortOrder: 2
    }
  ];

  // Filter active items and sort by sortOrder
  const displayItems = carouselItems
    .filter((item: any) => item.isActive)
    .sort((a: any, b: any) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {displayItems.map((item, index) => (
          index === currentSlide && (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="flex items-center h-full"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {item.onSale && (
                      <Badge className="bg-red-500 text-white mb-4">
                        On Sale
                      </Badge>
                    )}
                    {item.discount && (
                      <Badge className="bg-green-100 text-green-800 mb-4 ml-2">
                        Save {item.discount}
                      </Badge>
                    )}
                    <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
                      {item.title}
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-4xl font-bold text-teal-600">${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-2xl text-slate-400 line-through">${item.originalPrice}</span>
                      )}
                    </div>

                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl p-4 flex items-center justify-center overflow-hidden">
                    {item.imageUrl && item.imageUrl !== "/api/placeholder/400/300" ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Heart className="w-32 h-32 text-teal-600" />
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>
      
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={prevSlide}
          className="p-3 bg-white shadow-lg hover:shadow-xl border border-slate-200 rounded-full text-teal-600 hover:text-teal-700 transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
      
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={nextSlide}
          className="p-3 bg-white shadow-lg hover:shadow-xl border border-slate-200 rounded-full text-teal-600 hover:text-teal-700 transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [editingBrand, setEditingBrand] = useState<{ id: number; name: string; imageUrl: string } | null>(null);
  const [brandImageUrl, setBrandImageUrl] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Brand editing mutation
  const updateBrandMutation = useMutation({
    mutationFn: async (brandData: { id: number; imageUrl: string }) => {
      const response = await fetch(`/api/brands/${brandData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: brandData.imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update brand');
      }
      
      return response.json();
    },
    onSuccess: () => {
      success('Brand image updated successfully');
      setEditingBrand(null);
      setBrandImageUrl('');
      setImageFile(null);
      setPreviewUrl('');
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
    },
    onError: (err: Error) => {
      error(`Failed to update brand: ${err.message}`);
    },
  });

  // Category editing mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (categoryData: { id: number; icon: string }) => {
      const response = await fetch(`/api/categories/${categoryData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icon: categoryData.icon }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      return response.json();
    },
    onSuccess: () => {
      success('Category image updated successfully');
      setEditingCategory(null);
      setCategoryImageUrl('');
      setImageFile(null);
      setPreviewUrl('');
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: (err: Error) => {
      error(`Failed to update category: ${err.message}`);
    },
  });

  const handleBrandEdit = (brand: { id: number; name: string; imageUrl: string }) => {
    setEditingBrand(brand);
    setBrandImageUrl(brand.imageUrl);
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryImageUrl(category.icon || '');
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;

    let finalImageUrl = categoryImageUrl.trim();

    // If a file is selected, convert it to base64 for storage
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        updateCategoryMutation.mutate({
          id: editingCategory.id,
          icon: base64String,
        });
      };
      reader.readAsDataURL(imageFile);
    } else if (finalImageUrl) {
      // Use the URL provided
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        icon: finalImageUrl,
      });
    }
  };

  const handleSaveBrand = async () => {
    if (!editingBrand) return;

    let finalImageUrl = brandImageUrl.trim();

    // If a file is selected, convert it to base64 for storage
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        updateBrandMutation.mutate({
          id: editingBrand.id,
          imageUrl: base64String,
        });
      };
      reader.readAsDataURL(imageFile);
    } else if (finalImageUrl) {
      // Use the URL provided
      updateBrandMutation.mutate({
        id: editingBrand.id,
        imageUrl: finalImageUrl,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Clear URL input when file is selected
      setBrandImageUrl('');
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setBrandImageUrl('');
    setEditingCategory(null);
    setCategoryImageUrl('');
    setImageFile(null);
    setPreviewUrl('');
  };

  // Handle click outside search to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show suggestions when user types
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update CSS custom property for parallax effects
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY * 0.5}px`);
      
      // Reveal elements on scroll
      const elements = document.querySelectorAll('.scroll-reveal');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('revealed');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: brandsData = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const { data: featuredProductsResponse } = useQuery<{ products: ProductWithCategory[] }>({
    queryKey: ['/api/products', { featured: true }],
  });
  const featuredProducts = featuredProductsResponse?.products || [];

  // Fetch all products for search suggestions
  const { data: productsResponse } = useQuery<{ products: ProductWithCategory[] }>({
    queryKey: ['/api/products'],
  });
  const products = productsResponse?.products || [];

  // Filter products based on search query for suggestions
  const searchSuggestions = searchQuery.trim() 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6) // Limit to 6 suggestions
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchLoading(true);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setTimeout(() => setIsSearchLoading(false), 500);
    }
  };

  const handleSuggestionClick = (product: ProductWithCategory) => {
    setSearchQuery(product.name);
    setShowSuggestions(false);
    navigate(`/product/${product.id}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      setIsSearchLoading(true);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setTimeout(() => setIsSearchLoading(false), 500);
    }
  };

  const categoryIcons = {
    'electronics': Laptop,
    'fashion': Shirt,
    'home': Home,
    'sports': Dumbbell,
    'books': Book,
  };

  const colorVariants = {
    'blue': 'from-blue-50 to-blue-100 bg-blue-600',
    'green': 'from-green-50 to-green-100 bg-green-600',
    'purple': 'from-purple-50 to-purple-100 bg-purple-600',
    'teal': 'from-teal-50 to-teal-100 bg-teal-600',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden medical-gradient bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        {/* Clean Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 parallax-slow"></div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5 parallax-fast"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[600px]">
          <div className="float-animation">
            <HeroSlideshow />
          </div>
          
          {/* Enhanced Search with Live Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-12"
            ref={searchRef}
          >
            <div className="relative">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                  className="w-full pl-16 pr-24 py-6 text-lg bg-white border-2 border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-lg"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
                <Button
                  type="submit"
                  disabled={isSearchLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-medical-secondary"
                >
                  {isSearchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </form>

              {/* Live Search Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                  >
                    {/* Search Results Header */}
                    <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                      <p className="text-sm font-medium text-slate-700">
                        {searchSuggestions.length} product{searchSuggestions.length !== 1 ? 's' : ''} found
                      </p>
                    </div>

                    {/* Product Suggestions */}
                    <div className="py-2">
                      {searchSuggestions.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleSuggestionClick(product)}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors duration-200 flex items-center space-x-3"
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-md border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-slate-600 truncate">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-semibold text-teal-600">
                                ${product.price}
                              </span>
                              {product.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {product.category.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* View All Results Footer */}
                    <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                      <Button
                        onClick={handleViewAllResults}
                        variant="outline"
                        size="sm"
                        className="w-full text-teal-600 border-teal-600 hover:bg-teal-50"
                      >
                        View all results for "{searchQuery}"
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Medical Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/products?category=botulinum-toxins">
              <button className="pill-medical">
                Botulinum Toxins
              </button>
            </Link>
            <Link href="/products?category=dermal-fillers">
              <button className="pill-medical">
                Dermal Fillers
              </button>
            </Link>
            <Link href="/products?category=orthopedic">
              <button className="pill-medical">
                Orthopedic
              </button>
            </Link>
            <Link href="/products?category=rheumatology">
              <button className="pill-medical">
                Rheumatology
              </button>
            </Link>
            <Link href="/products?category=weightloss-gynecology">
              <button className="pill-medical">
                Weightloss & Gynecology
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Showcase Section */}
      <section className="py-20 bg-slate-50 scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-reveal">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">OUR BRANDS</h2>
            <p className="text-xl text-slate-600">Discover our range of top brands at amazing prices</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {categories.map((category, index) => (
              <div key={category.id} className="relative">
                <Link href="/products">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="group cursor-pointer scroll-reveal scale-on-scroll"
                  >
                    <div className="bg-white rounded-2xl p-6 aspect-square flex items-center justify-center group-hover:shadow-lg transition-all duration-300 border-2 border-dashed border-blue-200 group-hover:border-blue-400 relative">
                      {category.icon ? (
                        <img 
                          src={category.icon} 
                          alt={category.name}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-50 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                            <Heart className="w-8 h-8 text-blue-400 group-hover:text-blue-600" />
                          </div>
                          <p className="text-sm text-blue-500 group-hover:text-blue-700 font-medium">
                            {isAdmin ? 'Click to Upload Image' : category.name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors duration-300">
                        {category.name}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
                
                {/* Admin Edit Button */}
                {isAdmin && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryEdit(category);
                    }}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white border-blue-300 text-blue-600 hover:text-blue-700 p-2"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/products">
              <Button className="btn-medical">
                ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Newsletter Section */}
      <section className="py-20 bg-white border-t border-slate-200 scroll-reveal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-reveal">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Stay Updated</h2>
            <p className="text-xl text-slate-600 mb-10">Get the latest medical product updates and exclusive offers</p>
          </div>
          
          <div className="max-w-lg mx-auto">
            <NewsletterSubscription />
            <p className="text-sm text-slate-500 mt-4">Secure • No spam • Unsubscribe anytime</p>
          </div>
        </div>
      </section>

      {/* Edit Dialog - Works for both brands and categories */}
      <Dialog open={!!(editingBrand || editingCategory)} onOpenChange={() => handleCancelEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Edit Brand Image' : 'Edit Category Image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Brand Name
              </label>
              <Input
                value={editingBrand?.name || ''}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Brand Image
              </label>
              
              {/* File Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('brand-file-input')?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </Button>
                  <span className="text-sm text-slate-500">or enter URL below</span>
                </div>
                
                <input
                  id="brand-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Input
                  placeholder="Or enter image URL..."
                  value={editingBrand ? brandImageUrl : categoryImageUrl}
                  onChange={(e) => {
                    if (editingBrand) {
                      setBrandImageUrl(e.target.value);
                    } else {
                      setCategoryImageUrl(e.target.value);
                    }
                  }}
                  className="mb-2"
                />
              </div>
            </div>
            {(previewUrl || (editingBrand ? brandImageUrl : categoryImageUrl)) && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Preview
                </label>
                <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl || (editingBrand ? brandImageUrl : categoryImageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={editingBrand ? handleSaveBrand : handleSaveCategory}
                disabled={
                  (editingBrand && (!brandImageUrl.trim() && !imageFile)) ||
                  (editingCategory && (!categoryImageUrl.trim() && !imageFile)) ||
                  updateBrandMutation.isPending || updateCategoryMutation.isPending
                }
                className="flex-1"
              >
                {(updateBrandMutation.isPending || updateCategoryMutation.isPending) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Image
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateBrandMutation.isPending || updateCategoryMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}