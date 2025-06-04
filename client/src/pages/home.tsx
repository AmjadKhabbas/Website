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

// Best Sellers Carousel Component  
const BestSellersCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const bestSellers = [
    {
      id: 1,
      name: "Best Seller 1",
      description: "Premium medical treatment with excellent results",
      price: "$299.99",
      originalPrice: "$399.99",
      rating: 4.9,
      reviews: 156
    },
    {
      id: 2,
      name: "Best Seller 2", 
      description: "Professional grade medical product for healthcare providers",
      price: "$449.99",
      originalPrice: "$599.99",
      rating: 4.8,
      reviews: 203
    },
    {
      id: 3,
      name: "Best Seller 3",
      description: "Advanced medical solution trusted by professionals",
      price: "$699.99",
      originalPrice: "$899.99", 
      rating: 4.9,
      reviews: 187
    }
  ];

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bestSellers.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [bestSellers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bestSellers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bestSellers.length) % bestSellers.length);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-blue-500/20 p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <Badge className="bg-blue-600 text-white px-4 py-2 mb-4">
          <Star className="w-4 h-4 mr-2" />
          Best Sellers
        </Badge>
        <h3 className="text-2xl font-bold text-white">Top Medical Products</h3>
      </div>

      {/* Carousel */}
      <div className="relative h-64 overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-600/80 to-blue-700/80 rounded-xl flex items-center justify-center glow-subtle">
                <Heart className="w-16 h-16 text-white" />
              </div>
              
              <h4 className="text-2xl font-bold text-white mb-3">
                {bestSellers[currentSlide].name}
              </h4>
              
              <p className="text-blue-200 mb-4 leading-relaxed">
                {bestSellers[currentSlide].description}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-400">
                  {bestSellers[currentSlide].price}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {bestSellers[currentSlide].originalPrice}
                </span>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                    />
                  ))}
                </div>
                <span className="text-blue-200 text-sm">
                  {bestSellers[currentSlide].rating} ({bestSellers[currentSlide].reviews} reviews)
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600/80 hover:bg-blue-700 rounded-full text-white transition-colors duration-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600/80 hover:bg-blue-700 rounded-full text-white transition-colors duration-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {bestSellers.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide 
                ? 'bg-blue-400 w-8' 
                : 'bg-blue-600/50 hover:bg-blue-500'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden circuit-bg">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 5,
          }}
          className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/30 to-pink-500/30 rounded-full blur-lg"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-wide"
            >
              Professional
              <span className="block gradient-text">Medical Market</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto"
            >
              Premium Medical Products • Healthcare Excellence • Professional Quality
            </motion.p>
            
            {/* Best Sellers Slideshow */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-4xl mx-auto mb-12"
            >
              <BestSellersCarousel />
            </motion.div>

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
                  className="w-full pl-16 pr-24 py-6 text-lg bg-slate-800/60 border-2 border-blue-500/30 rounded-xl text-white placeholder-blue-300 focus:ring-4 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-500 backdrop-blur-xl"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6" />
                <Button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Search
                </Button>
              </form>
            </motion.div>

            {/* Quick Categories */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {categories.slice(0, 4).map((category, index) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <Button
                    variant="outline"
                    className="bg-slate-800/40 backdrop-blur-xl text-blue-300 border-blue-500/30 hover:bg-blue-500/15 hover:text-blue-400 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105 font-medium px-6 py-3 rounded-xl"
                  >
                    {category.name}
                  </Button>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 gradient-text">Medical Categories</h2>
            <p className="text-xl text-blue-200">Professional Healthcare Products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || Laptop;
              
              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link href={`/category/${category.slug}`}>
                    <div className="group cursor-pointer text-center p-6 card-medical hover:-translate-y-3">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 glow-subtle">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{category.name}</h3>
                      <p className="text-sm text-blue-300">{category.itemCount.toLocaleString()}+ Products</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 matrix-text">PRIME SELECTIONS</h2>
              <p className="text-xl text-purple-200 font-mono">NEURAL-CURATED PREMIUM UNITS</p>
            </div>
            <Link href="/products">
              <Button className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-600 hover:from-purple-700 hover:via-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-bold uppercase tracking-wider glow-neon">
                <span>ACCESS ALL</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 via-slate-900 to-cyan-900 circuit-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6 matrix-text">NEURAL LINK</h2>
          <p className="text-xl text-purple-200 mb-10 font-mono">SYNCHRONIZE WITH THE NEXUS • RECEIVE PRIORITY ACCESS</p>
          
          <div className="max-w-lg mx-auto">
            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="ENTER NEURAL ID..."
                className="flex-1 px-6 py-4 bg-slate-900/60 border-2 border-purple-500/40 rounded-2xl text-white placeholder-purple-300 focus:ring-4 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wider backdrop-blur-xl"
              />
              <Button className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 glow-neon">
                CONNECT
              </Button>
            </div>
            <p className="text-sm text-cyan-400 mt-4 font-mono">SECURE PROTOCOL • NO DATA MINING • INSTANT DISCONNECT</p>
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
