import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AdminUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AdminContextType = {
  admin: AdminUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AdminUser, Error, AdminLoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type AdminLoginData = {
  email: string;
  password: string;
};

export const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: admin,
    error,
    isLoading,
  } = useQuery<AdminUser | null>({
    queryKey: ["/api/admin/user"],
    queryFn: async () => {
      const response = await fetch("/api/admin/user");
      if (response.status === 401) {
        return null;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch admin");
      }
      return response.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginData) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Admin login failed");
      }
      
      const result = await response.json();
      return result.admin;
    },
    onSuccess: (admin: AdminUser) => {
      queryClient.setQueryData(["/api/admin/user"], admin);
      toast({
        title: "Admin login successful",
        description: `Welcome back, ${admin.name}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Admin login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Admin logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/user"], null);
      toast({
        title: "Logged out",
        description: "Admin session ended successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AdminContext.Provider
      value={{
        admin: admin ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}