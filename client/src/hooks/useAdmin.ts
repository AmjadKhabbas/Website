import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@shared/schema";

interface AdminLoginData {
  email: string;
  password: string;
}

interface AdminStatusResponse {
  isAdmin: boolean;
  admin: AdminUser | null;
}

interface ProductUpdateResponse {
  message: string;
  product: any;
}

export function useAdmin() {
  const { toast } = useToast();

  // Check admin status
  const {
    data: adminStatus,
    isLoading: isCheckingStatus,
    error: statusError,
  } = useQuery<AdminStatusResponse>({
    queryKey: ["/api/admin/status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/status");
      return await res.json();
    },
  });

  // Admin login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for session cookies
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/admin/status"], {
        isAdmin: true,
        admin: data.admin,
      });
      toast({
        title: "Admin Login Successful",
        description: `Welcome back, ${data.admin.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Admin Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/status"], {
        isAdmin: false,
        admin: null,
      });
      toast({
        title: "Admin Logout Successful",
        description: "You have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, price }: { productId: number; price: string }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${productId}/price`, { price });
      return await res.json();
    },
    onSuccess: (data: ProductUpdateResponse) => {
      // Invalidate products cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Price Updated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Price Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product image mutation
  const updateImageMutation = useMutation({
    mutationFn: async ({ productId, imageUrl }: { productId: number; imageUrl: string }) => {
      const res = await apiRequest("PUT", `/api/admin/products/${productId}/image`, { imageUrl });
      return await res.json();
    },
    onSuccess: (data: ProductUpdateResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Image Updated",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Image Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/products/${productId}`);
      return await res.json();
    },
    onSuccess: (data: ProductUpdateResponse) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product Deleted",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Product Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Admin status
    isAdmin: adminStatus?.isAdmin ?? false,
    admin: adminStatus?.admin ?? null,
    isCheckingStatus,
    statusError,

    // Authentication mutations
    loginMutation,
    logoutMutation,

    // Product management mutations
    updatePriceMutation,
    updateImageMutation,
    deleteProductMutation,
  };
}