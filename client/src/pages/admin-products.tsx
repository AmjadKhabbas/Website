import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Upload, 
  Image, 
  Plus, 
  Package, 
  DollarSign, 
  Tag, 
  FileText, 
  Camera,
  X,
  Loader2,
  Check,
  Percent
} from "lucide-react";
import type { Category } from "@shared/schema";
import { BulkDiscountManager, type BulkDiscountTier } from "@/components/bulk-discount-manager";

const productUploadSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  categoryId: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  tags: z.string().optional(),
});

type ProductUploadFormData = z.infer<typeof productUploadSchema>;

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [bulkDiscounts, setBulkDiscounts] = useState<BulkDiscountTier[]>([]);
  const [activeTab, setActiveTab] = useState("product");

  const form = useForm<ProductUploadFormData>({
    resolver: zodResolver(productUploadSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      featured: false,
      inStock: true,
      tags: "",
    },
  });

  // Fetch categories for selection
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Product creation mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create product");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created successfully",
        description: "The new product has been added to your catalog.",
      });
      form.reset();
      setUploadedImages([]);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageUploadLoading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please upload only image files.",
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please upload images smaller than 5MB.",
            variant: "destructive",
          });
          continue;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);

        // Upload to image service (placeholder for now)
        // In a real implementation, you'd upload to a cloud service like Cloudinary, AWS S3, etc.
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, imageUrl]);
        };
        reader.readAsDataURL(file);
      }

      toast({
        title: "Images uploaded",
        description: "Your product images have been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductUploadFormData) => {
    try {
      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        categoryId: parseInt(data.categoryId),
        imageUrl: uploadedImages[0] || "/api/placeholder/300/300",
        imageUrls: uploadedImages.slice(1),
        featured: data.featured,
        inStock: data.inStock,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        bulkDiscounts: bulkDiscounts,
      };

      await createProductMutation.mutateAsync(productData);
      
      // Reset form and state after successful creation
      form.reset();
      setUploadedImages([]);
      setBulkDiscounts([]);
    } catch (error) {
      console.error("Product creation failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8" />
              Add New Product
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Upload a new medical product to your catalog with images and detailed information
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="product" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Product Information
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Bulk Pricing
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="product" className="space-y-8 mt-6">
                    {/* Product Images Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                          disabled={imageUploadLoading}
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          {imageUploadLoading ? (
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                          ) : (
                            <Upload className="h-12 w-12 text-blue-600" />
                          )}
                          <p className="text-lg font-medium text-gray-700">
                            {imageUploadLoading ? "Uploading..." : "Click to upload product images"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Support: JPG, PNG, GIF up to 5MB each
                          </p>
                        </label>
                      </div>

                      {/* Image Preview Grid */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {uploadedImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              {index === 0 && (
                                <Badge className="absolute bottom-2 left-2 bg-blue-600">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Product Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Botox 200U (Allergan)"
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Price (CAD)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="215.00"
                                {...field}
                                className="h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Product Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed description of the medical product, its uses, benefits, and specifications..."
                              className="min-h-32 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Tags (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="botox, aesthetic, medical, treatment"
                              {...field}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Product Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Featured Product
                              </FormLabel>
                              <p className="text-sm text-gray-500">
                                Display this product prominently on the homepage
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                In Stock
                              </FormLabel>
                              <p className="text-sm text-gray-500">
                                Product is available for purchase
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                  </TabsContent>

                  <TabsContent value="bulk" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Bulk Discount Pricing</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        Set up quantity-based discounts. Base price: ${form.watch("price") || "0.00"}
                      </p>
                      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <BulkDiscountManager
                          basePrice={parseFloat(form.watch("price") || "0")}
                          discounts={bulkDiscounts}
                          onChange={setBulkDiscounts}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg px-8 py-3 h-auto"
                    disabled={createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}