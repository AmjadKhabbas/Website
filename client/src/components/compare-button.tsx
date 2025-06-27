import React from 'react';
import { Button } from '@/components/ui/button';
import { Scale, Check, X } from 'lucide-react';
import { useComparisonStore } from '@/lib/comparison';
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

interface CompareButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function CompareButton({ 
  product, 
  variant = 'outline', 
  size = 'sm',
  className = '' 
}: CompareButtonProps) {
  const { toast } = useToast();
  const {
    addToComparison,
    removeFromComparison,
    isInComparison
  } = useComparisonStore();

  const isComparing = isInComparison(product.id);

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComparing) {
      removeFromComparison(product.id);
      toast({
        title: "Removed from Comparison",
        description: `${product.name} has been removed from comparison.`,
      });
    } else {
      const result = addToComparison(product);
      toast({
        title: result.success ? "Added to Comparison" : "Cannot Add Product",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    }
  };

  return (
    <Button
      variant={isComparing ? 'default' : variant}
      size={size}
      onClick={handleToggleComparison}
      className={`
        ${isComparing 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'text-blue-600 border-blue-200 hover:bg-blue-50'
        } 
        ${className}
      `}
    >
      {isComparing ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Comparing
        </>
      ) : (
        <>
          <Scale className="h-4 w-4 mr-2" />
          Compare
        </>
      )}
    </Button>
  );
}

// Compact version for smaller spaces
export function CompareIcon({ product }: { product: Product }) {
  const { toast } = useToast();
  const {
    addToComparison,
    removeFromComparison,
    isInComparison
  } = useComparisonStore();

  const isComparing = isInComparison(product.id);

  const handleToggleComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isComparing) {
      removeFromComparison(product.id);
      toast({
        title: "Removed from Comparison",
        description: `${product.name} has been removed from comparison.`,
      });
    } else {
      const result = addToComparison(product);
      toast({
        title: result.success ? "Added to Comparison" : "Cannot Add Product",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleComparison}
      className={`
        p-2 h-8 w-8 rounded-full
        ${isComparing 
          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
          : 'text-blue-600 hover:bg-blue-50'
        }
      `}
      title={isComparing ? 'Remove from comparison' : 'Add to comparison'}
    >
      {isComparing ? (
        <Check className="h-4 w-4" />
      ) : (
        <Scale className="h-4 w-4" />
      )}
    </Button>
  );
}