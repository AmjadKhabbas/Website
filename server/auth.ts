import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Create PostgreSQL session store
const PostgresStore = connectPg(session);

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      fullName: string;
      isApproved: boolean;
      isLicenseVerified: boolean;
    }
  }
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function setupAuth(app: Express) {
  // Session configuration with PostgreSQL store
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'medical-marketplace-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: new PostgresStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy for email/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await storage.getUserByEmail(email);
          
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
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for session storage
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
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
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user account (pending approval)
      const newUser = await storage.createUser({
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

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed. Please try again." });
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed. Please try again." });
        }
        
        res.json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            isApproved: user.isApproved,
            isLicenseVerified: user.isLicenseVerified
          }
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      isApproved: req.user.isApproved,
      isLicenseVerified: req.user.isLicenseVerified
    });
  });

  // Admin routes for user approval (TODO: Add admin authentication middleware)
  app.post("/api/admin/approve-user/:userId", async (req, res) => {
    try {
      // TODO: Add admin authentication check
      const { userId } = req.params;
      const { approvedBy } = req.body;

      const approvedUser = await storage.approveUser(parseInt(userId), approvedBy);
      
      if (!approvedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // TODO: Send approval email notification to user
      
      res.json({
        message: "User approved successfully",
        user: approvedUser
      });
    } catch (error) {
      console.error("User approval error:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
}

// Middleware to protect routes that require authentication
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware to protect routes that require approved account
export const requireApprovedUser = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (!req.user.isApproved) {
    return res.status(403).json({ message: "Account pending approval" });
  }
  
  next();
};