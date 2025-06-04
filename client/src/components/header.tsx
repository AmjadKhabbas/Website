import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart';
import { MobileMenu } from '@/components/mobile-menu';
import { useQuery } from '@tanstack/react-query';
import type { Category } from '@shared/schema';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, navigate] = useLocation();
  
  const { getTotalItems, openCart } = useCartStore();
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: isScrolled ? 'rgba(15, 15, 35, 0.95)' : 'rgba(15, 15, 35, 0.90)',
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-xl border-b border-purple-500/30 glass-neon ${
          isScrolled ? 'shadow-2xl shadow-purple-500/20' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/">
                <motion.h1
                  whileHover={{ scale: 1.05 }}
                  className="text-3xl font-bold matrix-text cursor-pointer tracking-wider"
                >
                  NEXUS
                </motion.h1>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                <Link href="/">
                  <a className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-xl ${
                    location === '/' 
                      ? 'text-cyan-400 bg-purple-500/20 border border-cyan-400/50 glow-neon' 
                      : 'text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30'
                  }`}>
                    HOME
                  </a>
                </Link>
                
                {categories.slice(0, 4).map((category) => (
                  <Link key={category.slug} href={`/category/${category.slug}`}>
                    <a className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 rounded-xl ${
                      location === `/category/${category.slug}` 
                        ? 'text-cyan-400 bg-purple-500/20 border border-cyan-400/50 glow-neon' 
                        : 'text-purple-300 hover:text-cyan-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30'
                    }`}>
                      {category.name}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="SEARCH THE NEXUS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-20 py-4 bg-slate-900/50 border-2 border-purple-500/30 rounded-2xl text-white placeholder-purple-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 font-mono uppercase tracking-wider"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 transform hover:scale-105"
                >
                  SCAN
                </Button>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={openCart}
                className="relative p-3 text-purple-300 hover:text-cyan-400 bg-slate-900/30 hover:bg-purple-500/20 border border-purple-500/30 hover:border-cyan-400/50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="w-6 h-6" />
                <AnimatePresence>
                  {getTotalItems() > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold glow-neon">
                        {getTotalItems()}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* User Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center space-x-2 p-3 text-purple-300 hover:text-cyan-400 bg-slate-900/30 hover:bg-purple-500/20 border border-purple-500/30 hover:border-cyan-400/50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">ACCESS</span>
                <ChevronDown className="w-4 h-4" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-3 text-purple-300 hover:text-cyan-400 bg-slate-900/30 hover:bg-purple-500/20 border border-purple-500/30 hover:border-cyan-400/50 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />
    </>
  );
}
