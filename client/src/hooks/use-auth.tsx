
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, AdminUser } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  admin: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = {
  email: string;
  password: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: authData,
    error,
    isLoading,
  } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        return { user: null, admin: null, isAdmin: false };
      }
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      return {
        user: data.isAdmin ? null : data,
        admin: data.isAdmin ? data.admin : null,
        isAdmin: data.isAdmin || false
      };
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.isAdmin) {
        queryClient.setQueryData(["/api/auth/user"], {
          user: null,
          admin: data.admin,
          isAdmin: true
        });
        toast({
          title: "Admin login successful",
          description: `Welcome back, ${data.admin.name}!`,
        });
      } else {
        queryClient.setQueryData(["/api/auth/user"], {
          user: data.user,
          admin: null,
          isAdmin: false
        });
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.fullName}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], { user: null, admin: null, isAdmin: false });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
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
    <AuthContext.Provider
      value={{
        user: authData?.user ?? null,
        admin: authData?.admin ?? null,
        isAdmin: authData?.isAdmin ?? false,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
