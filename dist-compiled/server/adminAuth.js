"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthService = exports.AdminAuthService = void 0;
exports.requireAdminAuth = requireAdminAuth;
exports.checkAdminStatus = checkAdminStatus;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const storage_1 = require("./storage");
// Hardcoded admin credentials - securely stored with bcrypt
const ADMIN_EMAIL = 'amjadkhabbas2002@gmail.com';
const ADMIN_PASSWORD = 'akramsnotcool!';
const ADMIN_NAME = 'Amjad Khabbas';
/**
 * Admin Authentication Service
 * Handles secure admin login with bcrypt password hashing
 */
class AdminAuthService {
    /**
     * Initialize the admin user in the database
     * Creates the hardcoded admin user if it doesn't exist
     */
    async initializeAdminUser() {
        try {
            // Check if admin user already exists
            const existingAdmin = await storage_1.storage.getAdminByEmail(ADMIN_EMAIL);
            if (!existingAdmin) {
                // Hash the password securely
                const saltRounds = 12;
                const passwordHash = await bcryptjs_1.default.hash(ADMIN_PASSWORD, saltRounds);
                // Create admin user
                await storage_1.storage.createAdminUser({
                    email: ADMIN_EMAIL,
                    passwordHash,
                    name: ADMIN_NAME,
                    role: 'admin',
                    isActive: true
                });
                console.log('Admin user initialized successfully');
            }
        }
        catch (error) {
            console.error('Error initializing admin user:', error);
        }
    }
    /**
     * Authenticate admin user with email and password
     * @param email - Admin email address
     * @param password - Plain text password
     * @returns AdminUser if authenticated, null if failed
     */
    async authenticateAdmin(email, password) {
        try {
            // Find admin by email
            const admin = await storage_1.storage.getAdminByEmail(email);
            if (!admin || !admin.isActive) {
                return null;
            }
            // Verify password with bcrypt
            const isPasswordValid = await bcryptjs_1.default.compare(password, admin.passwordHash);
            if (!isPasswordValid) {
                return null;
            }
            // Update last login timestamp
            await storage_1.storage.updateAdminLastLogin(admin.id);
            return admin;
        }
        catch (error) {
            console.error('Error authenticating admin:', error);
            return null;
        }
    }
    /**
     * Verify if a user ID belongs to an active admin
     * @param adminId - Admin user ID
     * @returns AdminUser if valid, null if not found or inactive
     */
    async verifyAdmin(adminId) {
        try {
            const admin = await storage_1.storage.getAdminById(adminId);
            if (!admin || !admin.isActive) {
                return null;
            }
            return admin;
        }
        catch (error) {
            console.error('Error verifying admin:', error);
            return null;
        }
    }
}
exports.AdminAuthService = AdminAuthService;
// Export singleton instance
exports.adminAuthService = new AdminAuthService();
/**
 * Express middleware to require admin authentication
 * Checks session for admin user and verifies their status
 */
function requireAdminAuth(req, res, next) {
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
    exports.adminAuthService.verifyAdmin(adminId)
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
function checkAdminStatus(req, res, next) {
    const adminId = req.session?.adminId;
    if (!adminId) {
        req.isAdmin = false;
        req.admin = null;
        return next();
    }
    exports.adminAuthService.verifyAdmin(adminId)
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
//# sourceMappingURL=adminAuth.js.map