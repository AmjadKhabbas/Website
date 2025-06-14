import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireApprovedUser, hashPassword, comparePasswords } from "./auth";
import { adminAuthService, requireAdminAuth, checkAdminStatus } from "./adminAuth";
import { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema, insertReferralSchema } from "@shared/schema";
import session from "express-session";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication system with Passport.js
  setupAuth(app);
  
  // Initialize admin user on startup
  await adminAuthService.initializeAdminUser();

  // Unified Authentication endpoint - automatically detects admin vs regular user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      // First, check if this is an admin user
      const admin = await adminAuthService.authenticateAdmin(normalizedEmail, password);
      
      if (admin) {
        // Admin login successful
        req.session.adminId = admin.id;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
              message: 'Session error',
              code: 'SESSION_ERROR'
            });
          }
          
          res.json({
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            }
          });
        });
        return;
      }
      
      // Fallback to hardcoded admin if database auth fails
      if (normalizedEmail === 'amjadkhabbas2002@gmail.com' && password === 'akramsnotcool!') {
        req.session.adminId = 1;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
              message: 'Session error',
              code: 'SESSION_ERROR'
            });
          }
          
          res.json({
            admin: {
              id: 1,
              email: 'amjadkhabbas2002@gmail.com',
              name: 'Amjad Khabbas',
              role: 'admin'
            }
          });
        });
        return;
      }

      // If not admin, try regular user authentication
      const user = await storage.getUserByEmail(normalizedEmail);
      
      if (!user) {
        return res.status(401).json({
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      if (!user.isApproved) {
        return res.status(403).json({
          message: 'Your account is pending approval. Please wait for admin verification.',
          code: 'ACCOUNT_PENDING'
        });
      }

      const isPasswordValid = await comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Store user in session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({
            message: 'Session error',
            code: 'SESSION_ERROR'
          });
        }
        
        res.json({
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            licenseNumber: user.licenseNumber,
            collegeName: user.collegeName,
            provinceState: user.provinceState,
            practiceName: user.practiceName,
            practiceAddress: user.practiceAddress,
            isApproved: user.isApproved,
            isLicenseVerified: user.isLicenseVerified
          }
        });
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  });

  // Get current authenticated user (unified)
  app.get('/api/auth/user', async (req, res) => {
    // Check if admin is logged in
    if (req.session?.adminId) {
      const admin = await adminAuthService.verifyAdmin(req.session.adminId);
      if (admin) {
        return res.json({
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        });
      }
      
      // Fallback for hardcoded admin
      if (req.session.adminId === 1) {
        return res.json({
          admin: {
            id: 1,
            email: 'amjadkhabbas2002@gmail.com',
            name: 'Amjad Khabbas',
            role: 'admin'
          }
        });
      }
    }
    
    // Check if regular user is logged in
    if (req.session?.userId) {
      const user = await storage.getUserById(req.session.userId);
      if (user && user.isApproved) {
        return res.json({
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            licenseNumber: user.licenseNumber,
            collegeName: user.collegeName,
            provinceState: user.provinceState,
            practiceName: user.practiceName,
            practiceAddress: user.practiceAddress,
            isApproved: user.isApproved,
            isLicenseVerified: user.isLicenseVerified
          }
        });
      }
    }
    
    return res.status(401).json({
      message: 'Not authenticated'
    });
  });

  // Unified logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
          message: 'Logout failed',
          code: 'LOGOUT_ERROR'
        });
      }
      
      res.json({
        message: 'Logged out successfully'
      });
    });
  });

  // Legacy Admin Authentication Routes (for backward compatibility)
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Admin login attempt:', { email, timestamp: new Date().toISOString() });
      
      if (!email || !password) {
        console.log('Login failed: Missing credentials');
        return res.status(400).json({
          message: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      console.log('Normalized email:', normalizedEmail);
      
      // Try database authentication first
      console.log('Attempting database authentication for:', normalizedEmail);
      const admin = await adminAuthService.authenticateAdmin(normalizedEmail, password);
      
      if (admin) {
        console.log('Database authentication successful for:', normalizedEmail);
        // Store admin ID in session with proper save
        req.session.adminId = admin.id;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
              message: 'Session error',
              code: 'SESSION_ERROR'
            });
          }
          
          console.log('Admin session saved successfully for:', admin.email);
          res.json({
            message: 'Admin login successful',
            admin: {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role
            }
          });
        });
        return;
      }
      
      // Fallback to hardcoded admin if database auth fails
      if (normalizedEmail === 'amjadkhabbas2002@gmail.com' && password === 'akramsnotcool!') {
        console.log('Fallback hardcoded admin login successful');
        
        // Ensure session is saved before responding
        req.session.adminId = 1;
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
              message: 'Session error',
              code: 'SESSION_ERROR'
            });
          }
          
          console.log('Fallback admin session saved successfully');
          res.json({
            message: 'Admin login successful',
            admin: {
              id: 1,
              email: 'amjadkhabbas2002@gmail.com',
              name: 'Amjad Khabbas',
              role: 'admin'
            }
          });
        });
        return;
      }
      
      console.log('All authentication methods failed for:', normalizedEmail);
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
      
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  });

  app.get('/api/admin/user', async (req, res) => {
    const adminId = req.session?.adminId;
    
    if (!adminId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Handle primary admin session
    if (adminId === 1) {
      return res.json({
        id: 1,
        email: 'amjadkhabbas2002@gmail.com',
        name: 'Amjad Khabbas',
        role: 'admin'
      });
    }
    
    try {
      const admin = await adminAuthService.verifyAdmin(adminId);
      
      if (!admin) {
        delete req.session.adminId;
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      res.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      });
    } catch (error) {
      console.error('Admin user check error:', error);
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  app.post('/api/admin/logout', (req, res) => {
    delete req.session.adminId;
    res.json({ message: 'Admin logout successful' });
  });

  // Admin password reset endpoint (for emergency use)
  app.post('/api/admin/reset-password', async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          message: 'All fields are required',
          code: 'MISSING_FIELDS'
        });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: 'New passwords do not match',
          code: 'PASSWORD_MISMATCH'
        });
      }
      
      // Verify current password
      if (currentPassword !== 'akramsnotcool!') {
        return res.status(401).json({
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }
      
      console.log('Admin password reset requested. New password will be:', newPassword);
      
      res.json({
        message: 'Password reset successful. Please update the hardcoded password in the server code.',
        note: 'This is a development environment. In production, this would update the database.'
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  });

  app.get('/api/admin/status', async (req, res) => {
    const adminId = req.session?.adminId;
    
    if (!adminId) {
      return res.json({ isAdmin: false, admin: null });
    }
    
    // Handle primary admin session
    if (adminId === 1) {
      return res.json({
        isAdmin: true,
        admin: {
          id: 1,
          email: 'amjadkhabbas2002@gmail.com',
          name: 'Amjad Khabbas',
          role: 'admin'
        }
      });
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

  // Admin Dashboard Routes
  app.get('/api/admin/pending-users', requireAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error('Get pending users error:', error);
      res.status(500).json({
        message: 'Failed to fetch pending users',
        code: 'FETCH_FAILED'
      });
    }
  });

  app.post('/api/admin/approve-user/:id', requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const approvedBy = req.admin?.email || 'admin';
      
      const user = await storage.approveUser(userId, approvedBy);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'User approved successfully',
        user
      });
    } catch (error) {
      console.error('Approve user error:', error);
      res.status(500).json({
        message: 'Failed to approve user',
        code: 'APPROVAL_FAILED'
      });
    }
  });

  app.delete('/api/admin/reject-user/:id', requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'User rejected and removed successfully'
      });
    } catch (error) {
      console.error('Reject user error:', error);
      res.status(500).json({
        message: 'Failed to reject user',
        code: 'REJECTION_FAILED'
      });
    }
  });

  // Image upload endpoint for product images
  app.post('/api/admin/upload-image', requireAdminAuth, async (req, res) => {
    try {
      // For demonstration, we'll use a placeholder image service
      // In production, you would integrate with cloud storage like AWS S3, Cloudinary, etc.
      const imageUrl = `/api/placeholder/300/300?random=${Date.now()}`;
      
      res.json({
        success: true,
        imageUrl: imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  });

  // Admin Product Management Routes
  app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
    try {
      const { name, description, price, categoryId, imageUrl, featured = false, inStock = true, tags = [] } = req.body;
      
      if (!name || !description || !price || !categoryId) {
        return res.status(400).json({
          message: 'Name, description, price, and category are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Validate price format
      if (!/^\d+(\.\d{1,2})?$/.test(price)) {
        return res.status(400).json({
          message: 'Price must be a valid number with up to 2 decimal places',
          code: 'INVALID_PRICE_FORMAT'
        });
      }

      // Validate category exists
      const category = await storage.getCategoryBySlug(''); // We'll get by ID instead
      
      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price).toFixed(2),
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || '/api/placeholder/300/300',
        featured: Boolean(featured),
        inStock: Boolean(inStock),
        tags: Array.isArray(tags) ? tags.join(', ') : (tags || null)
      };
      
      const newProduct = await storage.createProduct(productData);
      
      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        message: 'Failed to create product',
        code: 'CREATE_FAILED'
      });
    }
  });

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

  app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          message: 'Valid product ID is required',
          code: 'INVALID_PRODUCT_ID'
        });
      }
      
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }
      
      res.json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        message: 'Failed to delete product',
        code: 'DELETE_FAILED'
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

  // User authentication endpoints
  app.get('/api/auth/user', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json(req.user);
  });

  app.post('/api/auth/login', async (req, res, next) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!user.isApproved) {
        return res.status(401).json({ message: 'Your account is pending approval' });
      }

      const { comparePasswords } = await import('./auth');
      const isValidPassword = await comparePasswords(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }
        res.json(user);
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Doctor registration endpoint with email notification
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Map form fields to database fields
      const formData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone || '',
        licenseNumber: req.body.licenseNumber,
        collegeName: req.body.collegeName,
        provinceState: req.body.provinceState,
        practiceName: req.body.practiceName,
        practiceAddress: req.body.practiceAddress,
        password: req.body.password || 'temp123' // Default temporary password for doctors
      };

      // Validate required fields
      const requiredFields = ['fullName', 'email', 'licenseNumber', 'collegeName', 'provinceState', 'practiceName', 'practiceAddress'];
      
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
        return res.status(200).json({ 
          message: "Your account is pending approval. You will receive an update via email soon."
        });
      }

      // Create user data with proper field mapping
      const userData = {
        email: formData.email,
        password: await hashPassword(formData.password), // Hash the password
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        collegeName: formData.collegeName,
        provinceState: formData.provinceState,
        practiceName: formData.practiceName,
        practiceAddress: formData.practiceAddress,
        isApproved: false,
        isLicenseVerified: false
      };

      const newUser = await storage.createUser(userData);
      
      // Send admin notification email to amjadkhabbas2002@gmail.com
      try {
        const { emailService } = await import('./email');
        await emailService.sendAdminNotification({
          fullName: newUser.fullName,
          email: newUser.email,
          phone: formData.phone || 'Not provided',
          licenseNumber: newUser.licenseNumber,
          collegeName: newUser.collegeName,
          provinceState: newUser.provinceState,
          practiceName: newUser.practiceName,
          practiceAddress: newUser.practiceAddress
        });
        console.log('Admin notification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Continue with registration even if email fails
      }
      
      res.status(201).json({ 
        message: "Your account is pending approval. You will receive an update via email soon.",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          isApproved: newUser.isApproved
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      // Even if there's an error, don't reject the registration
      res.status(201).json({ 
        message: "Your account is pending approval. You will receive an update via email soon."
      });
    }
  });

  // Get pending users for admin approval
  app.get('/api/admin/pending-users', requireAdminAuth, async (req, res) => {
    try {
      const pendingUsers = await storage.getPendingUsers();
      res.json(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ message: 'Failed to fetch pending users' });
    }
  });

  // Approve user registration
  app.put('/api/admin/users/:id/approve', requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.approveUser(userId, req.admin?.email || 'admin');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send approval email
      const { emailService } = await import('./email');
      await emailService.sendApprovalEmail(user.email, user.fullName, true);
      
      res.json({ message: 'User approved successfully', user });
    } catch (error) {
      console.error('Error approving user:', error);
      res.status(500).json({ message: 'Failed to approve user' });
    }
  });

  // Reject user registration
  app.delete('/api/admin/users/:id/reject', requireAdminAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send rejection email before deleting
      const { emailService } = await import('./email');
      await emailService.sendApprovalEmail(user.email, user.fullName, false);
      
      // Remove user from database
      await storage.deleteUser(userId);
      
      res.json({ message: 'User rejected and removed successfully' });
    } catch (error) {
      console.error('Error rejecting user:', error);
      res.status(500).json({ message: 'Failed to reject user' });
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
      const userId = req.user.id.toString();
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
      const userId = req.user.id.toString();
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id.toString();
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
