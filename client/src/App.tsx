import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { CartSidebar } from "@/components/cart-sidebar";
import { ToastContainer, useToast } from "@/components/toast";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminProvider } from "@/hooks/use-admin";
import HomePage from "@/pages/home";
import CategoryPage from "@/pages/category";
import ProductPage from "@/pages/product";
import ProductsPage from "@/pages/products";
import OrdersPage from "@/pages/orders";
import ReferralsPage from "@/pages/referrals";
import FAQPage from "@/pages/faq";
import ContactPage from "@/pages/contact";
import LoginPage from "@/pages/login";
import AdminLoginPage from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminProductsPage from "@/pages/admin-products";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/referrals" component={ReferralsPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { toasts, dismissToast } = useToast();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-slate-50">
              <Header />
              <main>
                <Router />
              </main>
              <CartSidebar />
              <ToastContainer toasts={toasts} onDismiss={dismissToast} />
              <Toaster />
            </div>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
