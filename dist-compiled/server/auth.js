"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApprovedUser = exports.requireAuth = void 0;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.setupAuth = setupAuth;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const express_session_1 = __importDefault(require("express-session"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const storage_1 = require("./storage");
const memorystore_1 = __importDefault(require("memorystore"));
// Use memory store for sessions since we switched to HTTP database connection
const MemoryStoreSession = (0, memorystore_1.default)(express_session_1.default);
// Password hashing utilities
async function hashPassword(password) {
    const saltRounds = 12;
    return bcryptjs_1.default.hash(password, saltRounds);
}
async function comparePasswords(plainPassword, hashedPassword) {
    return bcryptjs_1.default.compare(plainPassword, hashedPassword);
}
function setupAuth(app) {
    // Session configuration with Memory store
    const sessionSettings = {
        secret: process.env.SESSION_SECRET || 'medical-marketplace-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        store: new MemoryStoreSession({
            checkPeriod: 86400000 // prune expired entries every 24h
        }),
        cookie: {
            secure: false, // Set to false for Replit development
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax' // Add sameSite for better compatibility
        }
    };
    app.set("trust proxy", true);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Passport local strategy for email/password authentication
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            // Find user by email
            const user = await storage_1.storage.getUserByEmail(email);
            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            // Check if password matches
            const isValidPassword = await comparePasswords(password, user.password);
            if (!isValidPassword) {
                return done(null, false, { message: 'Invalid email or password' });
            }
            // Check if account is approved for login
            if (!user.isApproved) {
                return done(null, false, { message: 'Account pending approval. Please wait for admin verification.' });
            }
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    // Serialize user for session storage
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await storage_1.storage.getUserById(id);
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    // Registration endpoint for medical professionals
    app.post("/api/auth/register", async (req, res) => {
        try {
            const { email, password, confirmPassword, fullName, licenseNumber, collegeName, provinceState, practiceName, practiceAddress } = req.body;
            // Input validation
            if (!email || !password || !confirmPassword || !fullName || !licenseNumber || !collegeName || !provinceState || !practiceName || !practiceAddress) {
                return res.status(400).json({
                    message: "All fields are required",
                    missingFields: {
                        email: !email,
                        password: !password,
                        confirmPassword: !confirmPassword,
                        fullName: !fullName,
                        licenseNumber: !licenseNumber,
                        collegeName: !collegeName,
                        provinceState: !provinceState,
                        practiceName: !practiceName,
                        practiceAddress: !practiceAddress
                    }
                });
            }
            // Password confirmation check
            if (password !== confirmPassword) {
                return res.status(400).json({ message: "Passwords do not match" });
            }
            // Password strength validation
            if (password.length < 8) {
                return res.status(400).json({ message: "Password must be at least 8 characters long" });
            }
            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Please enter a valid email address" });
            }
            // Check if user already exists
            const existingUser = await storage_1.storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "An account with this email already exists" });
            }
            // Hash password
            const hashedPassword = await hashPassword(password);
            // Create user account (pending approval)
            const newUser = await storage_1.storage.createUser({
                email,
                password: hashedPassword,
                fullName,
                licenseNumber,
                collegeName,
                provinceState,
                practiceName,
                practiceAddress
            });
            // TODO: Add email notification to admins for approval
            // TODO: Add automated license verification integration
            // TODO: Add document upload functionality for license verification
            res.status(201).json({
                message: "Registration successful! Your account is pending approval. You will be notified once your medical license is verified.",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    isApproved: newUser.isApproved,
                    isLicenseVerified: newUser.isLicenseVerified
                }
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(500).json({ message: "Registration failed. Please try again." });
        }
    });
    // Auth routes moved to unified system in routes.ts
    // Admin routes for user approval (TODO: Add admin authentication middleware)
    app.post("/api/admin/approve-user/:userId", async (req, res) => {
        try {
            // TODO: Add admin authentication check
            const { userId } = req.params;
            const { approvedBy } = req.body;
            const approvedUser = await storage_1.storage.approveUser(parseInt(userId), approvedBy);
            if (!approvedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            // TODO: Send approval email notification to user
            res.json({
                message: "User approved successfully",
                user: approvedUser
            });
        }
        catch (error) {
            console.error("User approval error:", error);
            res.status(500).json({ message: "Failed to approve user" });
        }
    });
}
// Middleware to protect routes that require authentication
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
    }
    next();
};
exports.requireAuth = requireAuth;
// Middleware to protect routes that require approved account
const requireApprovedUser = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.user.isApproved) {
        return res.status(403).json({ message: "Account pending approval" });
    }
    next();
};
exports.requireApprovedUser = requireApprovedUser;
//# sourceMappingURL=auth.js.map