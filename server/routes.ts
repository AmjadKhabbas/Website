import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireApprovedUser, hashPassword } from "./auth";
import { adminAuthService, requireAdminAuth, checkAdminStatus } from "./adminAuth";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertReferralSchema } from "@shared/schema";
import session from "express-session";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication system with Passport.js
  setupAuth(app);
  
  // Initialize admin user on startup
  await adminAuthService.initializeAdminUser();

  // Admin Authentication Routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }
      
      const admin = await adminAuthService.authenticateAdmin(email, password);
      
      if (!admin) {
        return res.status(401).json({
          message: 'Invalid admin credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      // Store admin ID in session
      req.session.adminId = admin.id;
      
      res.json({
        message: 'Admin login successful',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    delete req.session.adminId;
    res.json({ message: 'Admin logout successful' });
  });

  app.get('/api/admin/status', async (req, res) => {
    const adminId = req.session?.adminId;
    
    if (!adminId) {
      return res.json({ isAdmin: false, admin: null });
    }
    
    try {
      const admin = await adminAuthService.verifyAdmin(adminId);
      
      if (!admin) {
        delete req.session.adminId;
        return res.json({ isAdmin: false, admin: null });
      }
      
      res.json({
        isAdmin: true,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (error) {
      console.error('Admin status check error:', error);
      res.json({ isAdmin: false, admin: null });
    }
  });

  // Admin Product Management Routes
  app.put('/api/admin/products/:id/price', requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { price } = req.body;
      
      if (!price || isNaN(parseFloat(price))) {
        return res.status(400).json({
          message: 'Valid price is required',
          code: 'INVALID_PRICE'
        });
      }
      
      const updatedProduct = await storage.updateProductPrice(productId, price);
      
      if (!updatedProduct) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'Product price updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product price error:', error);
      res.status(500).json({
        message: 'Failed to update product price',
        code: 'UPDATE_FAILED'
      });
    }
  });

  app.put('/api/admin/products/:id/image', requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({
          message: 'Image URL is required',
          code: 'MISSING_IMAGE_URL'
        });
      }
      
      const updatedProduct = await storage.updateProductImage(productId, imageUrl);
      
      if (!updatedProduct) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'Product image updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update product image error:', error);
      res.status(500).json({
        message: 'Failed to update product image',
        code: 'UPDATE_FAILED'
      });
    }
  });

  // Add admin status check to products route
  app.get('/api/products', checkAdminStatus, async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const categorySlug = req.query.categorySlug as string;
      const featured = req.query.featured === 'true';
      const search = req.query.search as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const products = await storage.getProductsWithCategory({
        categoryId,
        categorySlug,
        featured,
        search,
        limit
      });
      
      // Include admin status in response
      res.json({
        products,
        isAdmin: req.isAdmin || false
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Doctor registration endpoint with email confirmation
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Map form fields to database fields
      const formData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        licenseNumber: req.body.licenseNumber,
        collegeName: req.body.collegeName,
        provinceState: req.body.provinceState,
        practiceName: req.body.practiceName,
        practiceAddress: req.body.practiceAddress,
        password: req.body.password || 'temp123' // Default temporary password for doctors
      };

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'licenseNumber', 'collegeName', 'provinceState', 'practiceName', 'practiceAddress'];
      
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          return res.status(400).json({ 
            message: `Missing required field: ${field}` 
          });
        }
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(formData.email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "An account with this email already exists" 
        });
      }

      // Create user data with proper field mapping
      const userData = {
        email: formData.email,
        password: await hashPassword(formData.password), // Hash the password
        fullName: `${formData.firstName} ${formData.lastName}`,
        licenseNumber: formData.licenseNumber,
        collegeName: formData.collegeName,
        provinceState: formData.provinceState,
        practiceName: formData.practiceName,
        practiceAddress: formData.practiceAddress,
        isApproved: false,
        isLicenseVerified: false
      };

      const newUser = await storage.createUser(userData);
      
      // Send confirmation email
      const { emailService } = await import('./email');
      await emailService.sendDoctorRegistrationConfirmation(
        newUser.email, 
        newUser.fullName
      );
      
      // Send admin notification
      await emailService.sendAdminNotification({
        fullName: newUser.fullName,
        email: newUser.email,
        licenseNumber: newUser.licenseNumber,
        collegeName: newUser.collegeName,
        practiceName: newUser.practiceName,
        practiceAddress: newUser.practiceAddress
      });
      
      res.status(201).json({ 
        message: "Thank you. Your account is pending approval.",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          isApproved: newUser.isApproved
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Registration failed. Please try again." 
      });
    }
  });

  // Referrals route
  app.post('/api/referrals', async (req, res) => {
    try {
      const referralData = req.body;
      const referral = await storage.createReferral(referralData);
      res.status(201).json({ message: 'Referral submitted successfully', referral });
    } catch (error) {
      console.error('Error creating referral:', error);
      res.status(500).json({ message: 'Failed to submit referral' });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });



  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        sessionId,
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = req.session.id;
      await storage.clearCart(sessionId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Orders (Protected routes for logged-in users)
  app.post("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        status: 'pending'
      });
      
      const { items, ...order } = req.body;
      const orderItemsData = items.map((item: any) => 
        insertOrderItemSchema.parse(item)
      );
      
      const newOrder = await storage.createOrder(orderData, orderItemsData);
      res.json(newOrder);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/orders", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
