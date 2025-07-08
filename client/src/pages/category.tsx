import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SortAsc, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product-card';
import type { Category, ProductWithCategory } from '@shared/schema';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Show more items per page for admin users to make product management easier
  const { data: userResponse } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false
  });
  const isUserAdmin = userResponse?.admin || false;
  const itemsPerPage = isUserAdmin ? 50 : 15; // Admin sees 50 items per page, regular users see 15

  const { data: category } = useQuery<Category>({
    queryKey: ['/api/categories', slug],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${slug}`);
      if (!response.ok) throw new Error('Category not found');
      return response.json();
    },
  });

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['/api/products', category?.id, searchQuery, currentPage],
    queryFn: async () => {
      if (!category) return { products: [], totalCount: 0, currentPage: 1, totalPages: 1 };
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(`/api/products?categoryId=${category.id}&page=${currentPage}&limit=${itemsPerPage}${searchParam}`);
      return response.json();
    },
    enabled: !!category,
  });

  const products = productsResponse?.products || [];
  const totalCount = parseInt(productsResponse?.totalCount) || 0;
  const serverTotalPages = productsResponse?.totalPages || 1;

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Use server-side pagination
  const totalPages = serverTotalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const currentProducts = sortedProducts; // Products are already paginated from server

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!category) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Category Not Found</h1>
          <p className="text-slate-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Category Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-xl text-blue-100 mb-6">{category.description}</p>
            <p className="text-blue-200">{category.itemCount.toLocaleString()} products available</p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-slate-300 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-200 animate-pulse rounded-2xl h-96" />
              ))}
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">No products found</h3>
              <p className="text-slate-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'
              : 'space-y-6'
            }>
              {currentProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalCount > itemsPerPage && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>
                  Showing {startIndex + 1}-{endIndex} of {totalCount} products
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {totalPages <= 7 ? (
                    // Show all pages if 7 or fewer
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`min-w-[36px] ${
                          currentPage === page 
                            ? "bg-blue-600 text-white hover:bg-blue-700" 
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    // Show truncated pagination for more than 7 pages
                    <>
                      {currentPage > 3 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            className="min-w-[36px] text-slate-600 hover:text-slate-800"
                          >
                            1
                          </Button>
                          {currentPage > 4 && <span className="px-2 text-slate-400">...</span>}
                        </>
                      )}
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return page <= totalPages ? (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[36px] ${
                              currentPage === page 
                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                          >
                            {page}
                          </Button>
                        ) : null;
                      })}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="px-2 text-slate-400">...</span>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            className="min-w-[36px] text-slate-600 hover:text-slate-800"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
