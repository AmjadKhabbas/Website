import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, User, Menu, ChevronDown, LogIn, LogOut, Package, UserPlus, HelpCircle, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import medsGoLogo from '@assets/image_1749025160394.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart';
import { MobileMenu } from '@/components/mobile-menu';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import type { Category, ProductWithCategory } from '@shared/schema';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [location, navigate] = useLocation();

  // Sync search query with URL parameters when on products page
  useEffect(() => {
    if (location.startsWith('/products')) {
      const urlParams = new URLSearchParams(location.split('?')[1] || '');
      const searchParam = urlParams.get('search');
      if (searchParam) {
        setSearchQuery(decodeURIComponent(searchParam));
      } else {
        setSearchQuery('');
      }
    }
  }, [location]);

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

  const { getTotalItems, openCart, setItems } = useCartStore();
  const { user, admin, isLoading, isAdmin, logoutMutation } = useAuth();
  const isAuthenticated = !!user || !!admin;

  // Fetch cart data and sync with store
  const { data: cartData } = useQuery<any[]>({
    queryKey: ['/api/cart'],
    enabled: true, // Always fetch cart data
  });

  // Sync cart data with store when it changes
  useEffect(() => {
    if (cartData && Array.isArray(cartData)) {
      setItems(cartData);
    }
  }, [cartData, setItems]);

  // Fetch products for search suggestions
  const { data: productsResponse } = useQuery<{products: ProductWithCategory[]}>({
    queryKey: ['/api/products'],
  });
  const products = productsResponse?.products || [];

  // Filter products based on search query for suggestions
  const searchSuggestions = searchQuery.trim() 
    ? products.filter((product: ProductWithCategory) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6) // Limit to 6 suggestions
    : [];

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state for background changes
      setIsScrolled(currentScrollY > 50);

      // Handle fade effect based on scroll direction
      if (currentScrollY < 100) {
        // Always show header at top of page
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-slate-200 bg-white/95 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/">
                <motion.div 
                  className="flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img 
                    src={medsGoLogo} 
                    alt="Meds-Go" 
                    className="h-10 w-auto object-contain brightness-125 contrast-110"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Meds-Go</h1>
                    <p className="text-xs text-slate-600 -mt-1">Professional Healthcare Products</p>
                  </div>
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-1">
                <Link href="/">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/' 
                      ? 'text-teal-600 bg-teal-50 border border-teal-200' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200'
                  }`}>
                    Home
                  </span>
                </Link>

                <Link href="/products">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/products' 
                      ? 'text-teal-600 bg-teal-50 border border-teal-200' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200'
                  }`}>
                    Products
                  </span>
                </Link>

                <Link href="/referrals">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/referrals' 
                      ? 'text-teal-600 bg-teal-50 border border-teal-200' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200'
                  }`}>
                    Referrals
                  </span>
                </Link>

                <Link href="/faq">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/faq' 
                      ? 'text-teal-600 bg-teal-50 border border-teal-200' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200'
                  }`}>
                    FAQ
                  </span>
                </Link>

                <Link href="/contact">
                  <span className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg cursor-pointer ${
                    location === '/contact' 
                      ? 'text-teal-600 bg-teal-50 border border-teal-200' 
                      : 'text-slate-600 hover:text-teal-600 hover:bg-teal-50 border border-transparent hover:border-teal-200'
                  }`}>
                    Contact
                  </span>
                </Link>
              </nav>
            </div>

            {/* Search Bar with Live Filtering */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
              <div className="relative w-full">
                <form onSubmit={handleSearch} className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                    className="w-full pl-12 pr-20 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSearchLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-primary-foreground"
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
                      className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                    >
                      {/* Search Results Header */}
                      <div className="px-4 py-3 border-b border-border bg-muted/50">
                        <p className="text-sm font-medium text-foreground">
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
                            className="px-4 py-3 hover:bg-accent cursor-pointer transition-colors duration-200 flex items-center space-x-3"
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md border border-border"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-semibold text-primary">
                                  ${product.price}
                                </span>
                                {product.category && (
                                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {product.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* View All Results Footer */}
                      {searchQuery.trim() && (
                        <div className="px-4 py-3 border-t border-border bg-muted/50">
                          <button
                            onClick={handleViewAllResults}
                            className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No Results Message */}
                <AnimatePresence>
                  {showSuggestions && searchQuery.trim().length > 1 && searchSuggestions.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50"
                    >
                      <div className="px-4 py-6 text-center">
                        <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                          No products found for "{searchQuery}"
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try different keywords or browse our categories
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                  {isAdmin ? (
                    <div className="hidden sm:flex items-center space-x-3">
                      {/* Admin Dashboard Link */}
                      <Link href="/admin/dashboard">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 p-3 text-slate-600 hover:text-purple-600 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-lg transition-all duration-300"
                        >
                          <Package className="w-4 h-4" />
                          <span className="text-sm font-medium">Dashboard</span>
                        </Button>
                      </Link>

                      {/* Admin Profile with Email */}
                      <div className="flex items-center space-x-2 p-3 text-slate-600 bg-purple-50 border border-purple-200 rounded-lg">
                        <User className="w-5 h-5 text-purple-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-purple-600">Admin</span>
                          <span className="text-sm font-medium text-slate-700">{admin?.email}</span>
                        </div>
                      </div>

                      {/* Admin Logout Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="flex items-center space-x-2 p-3 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all duration-300"
                      >
                        {logoutMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">Logout</span>
                      </Button>
                    </div>
                  ) : isAuthenticated ? (
                    <div className="hidden sm:flex items-center space-x-3">
                      {/* Orders Link */}
                      <Link href="/orders">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 p-3 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all duration-300"
                        >
                          <Package className="w-4 h-4" />
                          <span className="text-sm font-medium">Orders</span>
                        </Button>
                      </Link>

                      {/* Referrals Link */}
                      <Link href="/referrals">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 p-3 text-slate-600 hover:text-green-600 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-200 rounded-lg transition-all duration-300"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm font-medium">Referrals</span>
                        </Button>
                      </Link>

                      {/* User Profile with Email */}
                      <div className="flex items-center space-x-2 p-3 text-slate-600 bg-blue-50 border border-blue-200 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-blue-600">Doctor</span>
                          <span className="text-sm font-medium text-slate-700">{user?.email}</span>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                        className="flex items-center space-x-2 p-3 text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all duration-300"
                      >
                        {logoutMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">Logout</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center space-x-2">
                      <Link href="/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 p-3 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all duration-300"
                        >
                          <LogIn className="w-5 h-5" />
                          <span className="text-sm font-medium">Doctor Login</span>
                        </Button>
                      </Link>
                      <Link href="/admin/login">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 p-3 text-slate-600 hover:text-purple-600 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-lg transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                          <span className="text-sm font-medium">Admin</span>
                        </Button>
                      </Link>
                    </div>
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