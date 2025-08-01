import bcrypt from 'bcryptjs';
import { storage } from './storage';
import type { AdminUser } from '@shared/schema';

// Hardcoded admin credentials - securely stored with bcrypt
const ADMIN_EMAIL = 'amjadkhabbas2002@gmail.com';
const ADMIN_PASSWORD = 'akramsnotcool!';
const ADMIN_NAME = 'Amjad Khabbas';

/**
 * Admin Authentication Service
 * Handles secure admin login with bcrypt password hashing
 */
export class AdminAuthService {
  
  /**
   * Initialize the admin user in the database
   * Creates the hardcoded admin user if it doesn't exist
   */
  async initializeAdminUser(): Promise<void> {
    try {
      // Check if admin user already exists
      const existingAdmin = await storage.getAdminByEmail(ADMIN_EMAIL);
      
      if (!existingAdmin) {
        // Hash the password securely
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);
        
        // Create admin user
        await storage.createAdminUser({
          email: ADMIN_EMAIL,
          passwordHash,
          name: ADMIN_NAME,
          role: 'admin',
          isActive: true
        });
        
        console.log('Admin user initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing admin user:', error);
    }
  }
  
  /**
   * Authenticate admin user with email and password
   * @param email - Admin email address
   * @param password - Plain text password
   * @returns AdminUser if authenticated, null if failed
   */
  async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    try {
      // Find admin by email
      const admin = await storage.getAdminByEmail(email);
      
      if (!admin || !admin.isActive) {
        return null;
      }
      
      // Verify password with bcrypt
      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // Update last login timestamp
      await storage.updateAdminLastLogin(admin.id);
      
      return admin;
    } catch (error) {
      console.error('Error authenticating admin:', error);
      return null;
    }
  }
  
  /**
   * Verify if a user ID belongs to an active admin
   * @param adminId - Admin user ID
   * @returns AdminUser if valid, null if not found or inactive
   */
  async verifyAdmin(adminId: number): Promise<AdminUser | null> {
    try {
      const admin = await storage.getAdminById(adminId);
      
      if (!admin || !admin.isActive) {
        return null;
      }
      
      return admin;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return null;
    }
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();

/**
 * Express middleware to require admin authentication
 * Checks session for admin user and verifies their status
 */
export function requireAdminAuth(req: any, res: any, next: any) {
  const adminId = req.session?.adminId;
  
  if (!adminId) {
    return res.status(401).json({ 
      message: 'Admin authentication required',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }
  
  // Handle primary admin session
  if (adminId === 1) {
    req.admin = {
      id: 1,
      email: 'amjadkhabbas2002@gmail.com',
      name: 'Amjad Khabbas',
      role: 'admin'
    };
    return next();
  }
  
  // Verify admin is still valid
  adminAuthService.verifyAdmin(adminId)
    .then(admin => {
      if (!admin) {
        delete req.session.adminId; // Clear invalid session
        return res.status(401).json({ 
          message: 'Invalid admin session',
          code: 'INVALID_ADMIN_SESSION'
        });
      }
      
      req.admin = admin; // Attach admin to request
      next();
    })
    .catch(error => {
      console.error('Admin auth middleware error:', error);
      res.status(500).json({ 
        message: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    });
}

/**
 * Express middleware to check if user is admin (optional)
 * Sets req.isAdmin flag without blocking non-admin access
 */
export function checkAdminStatus(req: any, res: any, next: any) {
  const adminId = req.session?.adminId;
  
  if (!adminId) {
    req.isAdmin = false;
    req.admin = null;
    return next();
  }
  
  adminAuthService.verifyAdmin(adminId)
    .then(admin => {
      req.isAdmin = !!admin;
      req.admin = admin;
      next();
    })
    .catch(error => {
      console.error('Admin status check error:', error);
      req.isAdmin = false;
      req.admin = null;
      next();
    });
}