import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, ChevronRight, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product-card';
import { CompactProductView } from '@/components/compact-product-view';
import { useLocation } from 'wouter';
import type { Product, ProductWithCategory, Category } from '@shared/schema';

export default function ProductsPage() {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedConcentration, setSelectedConcentration] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  // Parse URL search parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category');
    
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['/api/products', { 
      categorySlug: selectedCategory,
      search: searchQuery 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categorySlug', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });
  
  const products = productsResponse?.products || [];
  const isAdmin = productsResponse?.isAdmin || false;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Get all products for counting purposes (not filtered)
  const { data: allProductsResponse } = useQuery({
    queryKey: ['/api/products'],
  });
  const allProducts = (allProductsResponse as any)?.products || [];

  // Calculate product counts for each category based on all products
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: allProducts.filter((product: ProductWithCategory) => product.categoryId === category.id).length
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter((product: ProductWithCategory) => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const productPrice = parseFloat(product.price);
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    
    const matchesStock = !inStockOnly || product.inStock;
    
    return matchesSearch && matchesPrice && matchesStock;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-2 scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-2">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-slate-800 mb-2"
            >
              Medical Products
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-slate-600 max-w-2xl mx-auto"
            >
              Professional medical solutions for healthcare practitioners
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative"
          >
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-base"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-4">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex gap-4">
            {/* Sidebar - Medical Categories */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-64 flex-shrink-0"
            >
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                {/* Categories Tab Header */}
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full flex items-center justify-between text-lg font-semibold text-slate-800 mb-6 hover:text-blue-600 transition-colors duration-200"
                >
                  <span>Medical Categories</span>
                  <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                    isCategoriesOpen ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {/* Collapsible Categories List */}
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group ${
                        selectedCategory === null
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="font-medium">All Products</span>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                        selectedCategory === null ? 'rotate-90 text-blue-600' : 'group-hover:translate-x-1'
                      }`} />
                    </button>

                    {categoriesWithCounts.map((category) => (
                      <button
                        key={category.slug}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between group ${
                          selectedCategory === category.slug
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                          <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                            selectedCategory === category.slug ? 'rotate-90 text-blue-600' : 'group-hover:translate-x-1'
                          }`} />
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Filter Options */}
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Filter Options</h4>
                  
                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Price Range</label>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        max={2000}
                        min={0}
                        step={50}
                        className="w-full mb-4"
                      />
                      <div className="flex justify-between items-center gap-2 mt-4">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-slate-500 mb-1">Min</span>
                          <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(parseInt(e.target.value) || 0, priceRange[1] - 50));
                              setPriceRange([value, priceRange[1]]);
                            }}
                            className="w-full text-center text-sm h-8 border-blue-200 focus:border-blue-500"
                            min={0}
                            max={priceRange[1] - 50}
                          />
                        </div>
                        <span className="text-slate-400 text-sm px-2">-</span>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-xs text-slate-500 mb-1">Max</span>
                          <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const value = Math.min(2000, Math.max(parseInt(e.target.value) || 2000, priceRange[0] + 50));
                              setPriceRange([priceRange[0], value]);
                            }}
                            className="w-full text-center text-sm h-8 border-blue-200 focus:border-blue-500"
                            min={priceRange[0] + 50}
                            max={2000}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-2">
                        <span>$0</span>
                        <span>$2,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Concentration */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Concentration</label>
                    <Select value={selectedConcentration || undefined} onValueChange={(value) => setSelectedConcentration(value || null)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Concentrations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-concentrations">All Concentrations</SelectItem>
                        <SelectItem value="50-units">50 Units</SelectItem>
                        <SelectItem value="100-units">100 Units</SelectItem>
                        <SelectItem value="200-units">200 Units</SelectItem>
                        <SelectItem value="300-units">300 Units</SelectItem>
                        <SelectItem value="20mg">20mg/ml</SelectItem>
                        <SelectItem value="24mg">24mg/ml</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Stock Filter */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <label htmlFor="in-stock" className="text-sm font-medium text-slate-700 cursor-pointer">
                      In Stock Only
                    </label>
                  </div>

                  {/* Clear Filters */}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPriceRange([0, 2000]);
                      setSelectedConcentration(null);
                      setInStockOnly(false);
                    }}
                    className="w-full text-slate-600 hover:text-slate-800"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </motion.aside>

            {/* Products Grid */}
            <motion.main 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {searchQuery 
                      ? `Search results for "${searchQuery}"`
                      : selectedCategory 
                        ? categoriesWithCounts.find(cat => cat.slug === selectedCategory)?.name 
                        : 'All Products'
                    }
                  </h2>
                  <Badge variant="secondary">
                    {filteredProducts.length} products
                  </Badge>
                  {searchQuery && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Active Search
                    </Badge>
                  )}
                  
                  {/* Inline Search Bar */}
                  <div className="relative ml-4">
                    <Input
                      type="text"
                      placeholder="Quick search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-3 rounded-md transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      viewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-3 rounded-md transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                      viewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Products Display */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                      <div className="aspect-square bg-slate-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="text-slate-400 mb-4">
                    <Search className="w-16 h-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No products found</h3>
                  <p className="text-slate-500">
                    {searchQuery 
                      ? `No products match "${searchQuery}"`
                      : 'No products available in this category'
                    }
                  </p>
                </div>
              ) : (
                viewMode === 'grid' ? (
                  <CompactProductView products={filteredProducts} />
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product: ProductWithCategory, index: number) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="scroll-reveal"
                      >
                        <ProductCard product={product} index={index} viewMode={viewMode} />
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </motion.main>
          </div>
        </div>
      </section>
    </div>
  );
}