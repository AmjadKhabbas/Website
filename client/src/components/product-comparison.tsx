import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Plus, 
  Search, 
  Check, 
  Star, 
  DollarSign,
  Package,
  ShoppingCart,
  Scale,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  imageUrls?: string[];
  categoryId: number;
  featured: boolean;
  inStock: boolean;
  rating: string;
  reviewCount: number;
  tags?: string;
  bulkDiscounts?: any;
}

interface ComparisonFeature {
  label: string;
  getValue: (product: Product) => string | React.ReactNode;
  highlight?: boolean;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    label: 'Product Name',
    getValue: (product) => product.name,
    highlight: true
  },
  {
    label: 'Price (CAD)',
    getValue: (product) => (
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-green-600">${product.price}</span>
        {product.originalPrice && (
          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
        )}
      </div>
    ),
    highlight: true
  },
  {
    label: 'Availability',
    getValue: (product) => (
      <Badge variant={product.inStock ? 'default' : 'destructive'}>
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </Badge>
    )
  },
  {
    label: 'Rating',
    getValue: (product) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{product.rating}</span>
        <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
      </div>
    )
  },
  {
    label: 'Featured',
    getValue: (product) => (
      <Badge variant={product.featured ? 'default' : 'secondary'}>
        {product.featured ? 'Featured' : 'Standard'}
      </Badge>
    )
  },
  {
    label: 'Description',
    getValue: (product) => (
      <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
        {product.description}
      </div>
    )
  },
  {
    label: 'Tags',
    getValue: (product) => (
      <div className="flex flex-wrap gap-1">
        {product.tags?.split(',').map((tag, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag.trim()}
          </Badge>
        )) || <span className="text-gray-400">No tags</span>}
      </div>
    )
  },
  {
    label: 'Bulk Discounts',
    getValue: (product) => {
      const bulkDiscounts = product.bulkDiscounts;
      if (!bulkDiscounts || !Array.isArray(bulkDiscounts) || bulkDiscounts.length === 0) {
        return <span className="text-gray-400">No bulk pricing</span>;
      }
      
      return (
        <div className="space-y-1">
          {bulkDiscounts.slice(0, 3).map((discount: any, index: number) => (
            <div key={index} className="text-xs bg-blue-50 px-2 py-1 rounded">
              {discount.minQuantity}+ units: ${discount.price} ({discount.discountPercent}% off)
            </div>
          ))}
          {bulkDiscounts.length > 3 && (
            <div className="text-xs text-gray-500">+{bulkDiscounts.length - 3} more tiers</div>
          )}
        </div>
      );
    }
  }
];

export default function ProductComparison() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const { toast } = useToast();

  const { data: productsData } = useQuery({
    queryKey: ['/api/products'],
    enabled: showProductSelector
  });

  const products = (productsData as any)?.products || [];

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.tags && product.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addProductToComparison = (product: Product) => {
    if (selectedProducts.length >= 4) {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 4 products at once.",
        variant: "destructive"
      });
      return;
    }

    if (selectedProducts.find(p => p.id === product.id)) {
      toast({
        title: "Already Added",
        description: "This product is already in your comparison.",
        variant: "destructive"
      });
      return;
    }

    setSelectedProducts(prev => [...prev, product]);
    toast({
      title: "Product Added",
      description: `${product.name} has been added to comparison.`,
    });
  };

  const removeProductFromComparison = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
    toast({
      title: "Comparison Cleared",
      description: "All products have been removed from comparison.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="h-8 w-8 text-blue-600" />
            Product Comparison
          </h1>
          <p className="text-gray-600 mt-2">
            Compare up to 4 medical products side-by-side to make informed decisions
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => setShowProductSelector(!showProductSelector)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Products
          </Button>
          
          {selectedProducts.length > 0 && (
            <Button
              variant="outline"
              onClick={clearComparison}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Product Selector */}
      {showProductSelector && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Products to Compare
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product: Product) => (
                  <div
                    key={product.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => addProductToComparison(product)}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-green-600">${product.price}</span>
                          <Badge variant={product.inStock ? 'default' : 'secondary'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {selectedProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Comparing {selectedProducts.length} Product{selectedProducts.length > 1 ? 's' : ''}</span>
              <div className="text-sm text-gray-500">
                Scroll horizontally to see all products
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <div className="min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-4 bg-gray-50 border-b font-medium text-gray-700 min-w-32">
                        Features
                      </th>
                      {selectedProducts.map((product) => (
                        <th key={product.id} className="p-4 bg-gray-50 border-b min-w-64">
                          <div className="space-y-3">
                            <div className="relative">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded-lg mx-auto"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => removeProductFromComparison(product.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <h3 className="font-medium text-gray-900 text-center">{product.name}</h3>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, featureIndex) => (
                      <tr key={feature.label} className={featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className={`p-4 border-b font-medium text-gray-700 ${feature.highlight ? 'bg-blue-50' : ''}`}>
                          {feature.label}
                        </td>
                        {selectedProducts.map((product) => (
                          <td key={product.id} className={`p-4 border-b text-center ${feature.highlight ? 'bg-blue-50' : ''}`}>
                            {feature.getValue(product)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-white">
                      <td className="p-4 border-b font-medium text-gray-700">
                        Actions
                      </td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-4 border-b text-center">
                          <div className="space-y-2">
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              disabled={!product.inStock}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Info className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Scale className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Products Selected
            </h2>
            <p className="text-gray-500 mb-6">
              Choose products from the catalog to start comparing their features side-by-side
            </p>
            <Button
              onClick={() => setShowProductSelector(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Select Products to Compare
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}