import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, LogIn, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart';
import { MobileMenu } from '@/components/mobile-menu';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import type { Category } from '@shared/schema';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, navigate] = useLocation();
  
  const { getTotalItems, openCart } = useCartStore();
  const { user, isLoading, isAuthenticated } = useAuth();
  
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-sm border-b border-slate-200 bg-white/95 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/">
                <motion.h1
                  whileHover={{ scale: 1.05 }}
                  className="text-3xl font-bold text-slate-800 cursor-pointer tracking-tight"
                >
                  <span className="gradient-text">MedMarket</span>
                </motion.h1>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                <Link href="/">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/' 
                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}>
                    Home
                  </span>
                </Link>
                
                <Link href="/products">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/products' 
                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}>
                    Products
                  </span>
                </Link>

                <Link href="/referrals">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/referrals' 
                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}>
                    Referrals
                  </span>
                </Link>

                <Link href="/faqs">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/faqs' 
                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}>
                    FAQS
                  </span>
                </Link>

                <Link href="/contact">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/contact' 
                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}>
                    Contact
                  </span>
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search medical products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-medical-secondary"
                >
                  Search
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
                className="relative p-3 text-slate-600 hover:text-teal-600 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg transition-all duration-300"
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
                      <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                        {getTotalItems()}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* User Authentication */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center space-x-3">
                      {/* User Profile */}
                      <div className="flex items-center space-x-2 p-3 text-slate-600 bg-white border border-slate-200 rounded-lg">
                        {user?.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt="Profile" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {user?.firstName || user?.email || 'User'}
                        </span>
                      </div>
                      
                      {/* Logout Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = '/api/logout'}
                        className="flex items-center space-x-2 p-3 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = '/api/login'}
                      className="hidden sm:flex items-center space-x-2 p-3 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all duration-300"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="text-sm font-medium">Login</span>
                    </Button>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-3 text-slate-600 hover:text-teal-600 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg transition-all duration-300"
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
