import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Laptop, Shirt, Home, Dumbbell, Book, Heart, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { AnimatedVial } from '@/components/animated-vial';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import type { Category, ProductWithCategory } from '@shared/schema';

// Hero Slideshow Component - Full Section Slideshow
const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const bestSellers = [
    {
      id: 1,
      name: "Premium Botox Treatment",
      description: "Professional grade botulinum toxin for cosmetic procedures",
      price: "699.99",
      originalPrice: "899.99",
      discount: "22%",
      image: "/api/placeholder/400/300"
    },
    {
      id: 2,
      name: "Dermal Filler Kit",
      description: "Complete hyaluronic acid filler collection",
      price: "549.99",
      originalPrice: "749.99",
      discount: "27%",
      image: "/api/placeholder/400/300"
    },
    {
      id: 3,
      name: "Medical Equipment Set",
      description: "Professional injection and treatment tools",
      price: "899.99",
      originalPrice: "1199.99",
      discount: "25%",
      image: "/api/placeholder/400/300"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bestSellers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bestSellers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bestSellers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bestSellers.length) % bestSellers.length);
  };

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {bestSellers.map((product, index) => (
          index === currentSlide && (
            <motion.div
              key={product.id}
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
                    <Badge className="bg-green-100 text-green-800 mb-4">
                      Save {product.discount}
                    </Badge>
                    <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
                      {product.name}
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-4xl font-bold text-teal-600">${product.price}</span>
                      <span className="text-2xl text-slate-400 line-through">${product.originalPrice}</span>
                    </div>
                    <Button className="btn-fox text-lg px-8 py-4">
                      Shop Now
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl p-12 flex items-center justify-center">
                    <Heart className="w-32 h-32 text-teal-600" />
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

  const { data: featuredProductsResponse } = useQuery({
    queryKey: ['/api/products', { featured: true }],
  });
  const featuredProducts = featuredProductsResponse?.products || [];

  // Fetch all products for search suggestions
  const { data: productsResponse } = useQuery({
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
            {[
              'Botulinum Toxins',
              'Dermal Fillers', 
              'Anti-Aging Serums',
              'Medical Equipment',
              'Skincare Products'
            ].map((brandName, index) => (
              <Link key={index} href="/products">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group cursor-pointer scroll-reveal scale-on-scroll"
                >
                  <div className="bg-blue-50 rounded-2xl p-8 aspect-square flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300 border-2 border-dashed border-blue-300 group-hover:border-blue-500">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:from-teal-100 group-hover:to-cyan-100 transition-all duration-300">
                        <AnimatedVial size="sm" className="transform-gpu" />
                      </div>
                      <p className="text-sm text-blue-600 group-hover:text-blue-800 font-medium">Upload Image</p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors duration-300">
                      {brandName}
                    </h3>
                  </div>
                </motion.div>
              </Link>
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

      {/* Featured Products Section */}
      <section className="py-20 bg-white scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16 scroll-reveal">
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-4">Featured Products</h2>
              <p className="text-xl text-slate-600">Premium Medical Solutions</p>
            </div>
            <div className="flex items-center gap-4">
              {!showAllFeatured && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFeaturedIndex(Math.max(0, featuredIndex - 1))}
                    disabled={featuredIndex === 0}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      featuredIndex === 0 
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setFeaturedIndex(Math.min(featuredProducts.length - 4, featuredIndex + 1))}
                    disabled={featuredIndex >= featuredProducts.length - 4}
                    className={`p-2 rounded-lg border transition-all duration-300 ${
                      featuredIndex >= featuredProducts.length - 4
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              <Button 
                onClick={() => setShowAllFeatured(!showAllFeatured)}
                className="btn-medical-secondary"
              >
                {showAllFeatured ? 'Show Less' : 'View All'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className={`grid gap-6 transition-all duration-500 ${
            showAllFeatured ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {(showAllFeatured ? featuredProducts : featuredProducts.slice(featuredIndex, featuredIndex + 4)).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card-fox p-6 group cursor-pointer scroll-reveal scale-on-scroll"
              >
                <div className="aspect-square bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Heart className="w-12 h-12 text-teal-600" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg group-hover:text-teal-600 transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-teal-600">${product.price}</span>
                    <span className="text-lg text-slate-400 line-through">$299.99</span>
                  </div>
                  
                  <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200">
                    {product.category?.name || 'Medical'}
                  </Badge>
                </div>
              </motion.div>
            ))}
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
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
              />
              <Button className="btn-medical px-8 py-4">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">Secure • No spam • Unsubscribe anytime</p>
          </div>
        </div>
      </section>

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