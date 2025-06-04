import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Laptop, Shirt, Home, Dumbbell, Book, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
      title: "Best Seller 1",
      subtitle: "Premium Medical Excellence",
      description: "Professional grade medical product trusted by healthcare providers worldwide",
      price: "$299.99",
      originalPrice: "$399.99",
      features: ["FDA Approved", "Premium Quality", "Fast Results"]
    },
    {
      id: 2,
      title: "Best Seller 2", 
      subtitle: "Advanced Healthcare Solutions",
      description: "State-of-the-art medical treatment for professional use in clinical settings",
      price: "$449.99",
      originalPrice: "$599.99",
      features: ["Clinically Tested", "Professional Grade", "Proven Results"]
    },
    {
      id: 3,
      title: "Best Seller 3",
      subtitle: "Elite Medical Products",
      description: "Premium medical solution designed for the most demanding healthcare applications",
      price: "$699.99",
      originalPrice: "$899.99",
      features: ["Medical Grade", "Industry Leading", "Expert Recommended"]
    }
  ];

  // Auto-advance slides every 5 seconds
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
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 text-lg shadow-lg">
              <Star className="w-5 h-5 mr-2" />
              {bestSellers[currentSlide].subtitle}
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 mb-8 tracking-wide"
          >
            <span className="gradient-text">{bestSellers[currentSlide].title}</span>
          </motion.h1>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {bestSellers[currentSlide].description}
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {bestSellers[currentSlide].features.map((feature, index) => (
              <Badge key={index} variant="outline" className="border-teal-300 text-teal-600 bg-white px-4 py-2">
                {feature}
              </Badge>
            ))}
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-4 mb-10"
          >
            <span className="text-4xl font-bold text-teal-600">
              {bestSellers[currentSlide].price}
            </span>
            <span className="text-xl text-slate-400 line-through">
              {bestSellers[currentSlide].originalPrice}
            </span>
            <Badge className="bg-green-600 text-white px-3 py-1">
              Save {Math.round(((parseFloat(bestSellers[currentSlide].originalPrice.slice(1)) - parseFloat(bestSellers[currentSlide].price.slice(1))) / parseFloat(bestSellers[currentSlide].originalPrice.slice(1))) * 100)}%
            </Badge>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
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

      {/* Slide Indicators */}
      <div className="flex justify-center gap-3 mt-12">
        {bestSellers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-teal-500 w-12' 
                : 'bg-slate-300 hover:bg-teal-300 w-3'
            }`}
          />
        ))}
      </div>
    </div>
  );
};



export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [, navigate] = useLocation();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [showAllFeatured, setShowAllFeatured] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: featuredProducts = [] } = useQuery<ProductWithCategory[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true&limit=4');
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categoryIcons = {
    'electronics': Laptop,
    'fashion': Shirt,
    'home': Home,
    'sports': Dumbbell,
    'books': Book,
    'health': Heart,
  };

  const categoryColors = {
    'blue': 'from-blue-50 to-blue-100 bg-blue-600',
    'pink': 'from-pink-50 to-pink-100 bg-pink-600',
    'green': 'from-green-50 to-green-100 bg-green-600',
    'orange': 'from-orange-50 to-orange-100 bg-orange-600',
    'purple': 'from-purple-50 to-purple-100 bg-purple-600',
    'teal': 'from-teal-50 to-teal-100 bg-teal-600',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden fox-pattern bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20">
        {/* Clean Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-r from-teal-200/40 to-cyan-200/40 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-r from-cyan-200/40 to-teal-200/40 rounded-full blur-2xl"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <HeroSlideshow />

          {/* Enhanced Search */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search medical products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-24 py-6 text-lg bg-white border-2 border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 shadow-lg"
              />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
              <Button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Search
              </Button>
            </form>
          </motion.div>

          {/* Quick Categories */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.slice(0, 4).map((category, index) => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                <Button
                  variant="outline"
                  className="bg-white border-2 border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg"
                >
                  {category.name}
                </Button>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Medical Category Pills Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium">
              Botulinum Toxins
            </button>
            <button className="px-6 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium">
              Dermal Fillers
            </button>
            <button className="px-6 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium">
              Orthopedic
            </button>
            <button className="px-6 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium">
              Rheumatology
            </button>
            <button className="px-6 py-3 bg-white border-2 border-teal-200 text-teal-700 rounded-full hover:bg-teal-50 hover:border-teal-300 transition-all duration-300 font-medium">
              Weightloss & Gynecology
            </button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Medical Categories Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-6 text-lg">Medical Categories</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-300 font-medium">
                    Botulinum Toxins
                  </button>
                  <button className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-300 font-medium">
                    Dermal Fillers
                  </button>
                  <button className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-300 font-medium">
                    Orthopedic
                  </button>
                  <button className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-300 font-medium">
                    Rheumatology
                  </button>
                  <button className="w-full text-left px-4 py-3 text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-all duration-300 font-medium">
                    Weightloss & Gynecology
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-800 mb-6">Premium Medical Products</h2>
                <p className="text-xl text-slate-600">Professional Healthcare Solutions</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.slice(0, 6).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card-fox p-6 group cursor-pointer"
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
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
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
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600'
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
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-600'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              <Button 
                onClick={() => setShowAllFeatured(!showAllFeatured)}
                className="btn-fox"
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
                className="card-fox p-6 group cursor-pointer"
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
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">Stay Updated</h2>
          <p className="text-xl text-slate-600 mb-10">Get the latest medical product updates and exclusive offers</p>
          
          <div className="max-w-lg mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
              />
              <Button className="btn-fox px-8 py-4">
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
