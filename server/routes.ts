import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertEhriAccountSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Ehri Account Linking Routes
  app.post('/api/auth/link-ehri', async (req, res) => {
    try {
      const { ehriId, email } = req.body;
      
      // Check if Ehri account already exists
      const existingAccount = await storage.getEhriAccountByEhriId(ehriId);
      if (existingAccount) {
        return res.status(400).json({ message: 'Ehri account already linked' });
      }
      
      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);
      
      // Create Ehri account entry
      const ehriAccount = await storage.createEhriAccount({
        ehriId,
        email,
        verificationToken
      });
      
      res.json({ 
        message: 'Ehri account linking initiated. Please verify with the provided token.',
        verificationToken,
        ehriAccountId: ehriAccount.id
      });
    } catch (error) {
      console.error('Error linking Ehri account:', error);
      res.status(500).json({ message: 'Failed to link Ehri account' });
    }
  });

  app.post('/api/auth/verify-ehri', async (req, res) => {
    try {
      const { ehriId, token } = req.body;
      
      const verified = await storage.verifyEhriAccount(ehriId, token);
      if (verified) {
        res.json({ message: 'Ehri account verified successfully' });
      } else {
        res.status(400).json({ message: 'Invalid verification token or Ehri ID' });
      }
    } catch (error) {
      console.error('Error verifying Ehri account:', error);
      res.status(500).json({ message: 'Failed to verify Ehri account' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = req.body;
      
      // Validate that the Ehri account exists and is verified
      const ehriAccount = await storage.getEhriAccountByEhriId(userData.ehriId);
      if (!ehriAccount) {
        return res.status(400).json({ message: 'Ehri account not found. Please link your Ehri account first.' });
      }
      
      if (!ehriAccount.isVerified) {
        return res.status(400).json({ message: 'Ehri account not verified. Please verify your Ehri account first.' });
      }
      
      // Check if user already exists with this email
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Create user with Ehri account reference
      const userToCreate = {
        ...userData,
        ehriAccountId: ehriAccount.id
      };
      
      const newUser = await storage.createUser(userToCreate);
      res.status(201).json({ 
        message: 'Registration successful. Your account is pending approval.',
        user: newUser
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  app.get('/api/auth/check-ehri/:ehriId', async (req, res) => {
    try {
      const { ehriId } = req.params;
      const ehriAccount = await storage.getEhriAccountByEhriId(ehriId);
      
      res.json({
        exists: !!ehriAccount,
        verified: ehriAccount?.isVerified || false,
        linked: ehriAccount?.linkedAt ? true : false
      });
    } catch (error) {
      console.error('Error checking Ehri account:', error);
      res.status(500).json({ message: 'Failed to check Ehri account' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(parseInt(userId));
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, categorySlug, featured, limit, search } = req.query;
      
      let finalCategoryId = categoryId ? parseInt(categoryId as string) : undefined;
      
      // If categorySlug is provided, find the category ID
      if (categorySlug && !finalCategoryId) {
        const category = await storage.getCategoryBySlug(categorySlug as string);
        if (category) {
          finalCategoryId = category.id;
        }
      }
      
      const options = {
        categoryId: finalCategoryId,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
      };
      
      const products = await storage.getProductsWithCategory(options);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
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
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
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

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
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
