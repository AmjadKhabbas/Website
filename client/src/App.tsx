import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast";

import Home from "@/pages/home";
import Products from "@/pages/products";
import Product from "@/pages/product";
import Category from "@/pages/category";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Auth from "@/pages/auth";
import Orders from "@/pages/orders";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import Register from "@/pages/register";
import Referrals from "@/pages/referrals";
import LinkEhri from "@/pages/link-ehri";
import AdminProducts from "@/pages/admin-products";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ToastProvider>
          <div className="min-h-screen bg-background">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/products" component={Products} />
              <Route path="/products/:id" component={Product} />
              <Route path="/category/:slug" component={Category} />
              <Route path="/contact" component={Contact} />
              <Route path="/faq" component={FAQ} />
              <Route path="/auth" component={Auth} />
              <Route path="/orders" component={Orders} />
              <Route path="/login" component={Login} />
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/register" component={Register} />
              <Route path="/referrals" component={Referrals} />
              <Route path="/link-ehri" component={LinkEhri} />
              <Route path="/admin/products" component={AdminProducts} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Toaster />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}