/**
 * Security Enhancement Module
 * Implements anti-hacking and phishing protection for credit card information
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Encryption key for sensitive data (should be in environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

/**
 * Enhanced encryption for credit card and bank information
 */
export class SecureDataHandler {
  private static encryptionKey = Buffer.from(ENCRYPTION_KEY, 'hex');

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  static encryptSensitiveData(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(ALGORITHM, this.encryptionKey);
      cipher.setAAD(Buffer.from('medical-marketplace', 'utf8'));
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return JSON.stringify({
        iv: iv.toString('hex'),
        encrypted,
        authTag: authTag.toString('hex'),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData: string): string {
    try {
      const { iv, encrypted, authTag, timestamp } = JSON.parse(encryptedData);
      
      // Check if data is not too old (optional security measure)
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (Date.now() - timestamp > maxAge) {
        throw new Error('Encrypted data has expired');
      }
      
      const decipher = crypto.createDecipher(ALGORITHM, this.encryptionKey);
      decipher.setAAD(Buffer.from('medical-marketplace', 'utf8'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  /**
   * Mask credit card numbers for display
   */
  static maskCreditCard(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return '****';
    return '**** **** **** ' + cleaned.slice(-4);
  }

  /**
   * Mask bank account numbers for display
   */
  static maskBankAccount(accountNumber: string): string {
    const cleaned = accountNumber.replace(/\D/g, '');
    if (cleaned.length < 4) return '****';
    return '****' + cleaned.slice(-4);
  }
}

/**
 * Rate limiting for sensitive endpoints
 */
export const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests from this IP for sensitive operations',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiting
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security headers middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite dev
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

/**
 * Input validation and sanitization
 */
export class InputValidator {
  /**
   * Validate and sanitize credit card number
   */
  static validateCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check length (13-19 digits for most cards)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }
    
    // Luhn algorithm validation
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string): string {
    return input
      .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate bank routing number (US format)
   */
  static validateRoutingNumber(routingNumber: string): boolean {
    const cleaned = routingNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 9) {
      return false;
    }
    
    // Checksum validation for US routing numbers
    const digits = cleaned.split('').map(Number);
    const checksum = 
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      1 * (digits[2] + digits[5] + digits[8]);
    
    return checksum % 10 === 0;
  }
}

/**
 * Session security middleware
 */
export const secureSession = (req: Request, res: Response, next: NextFunction) => {
  // Regenerate session ID periodically
  if (req.session && Math.random() < 0.1) { // 10% chance
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      next();
    });
  } else {
    next();
  }
};

/**
 * Audit logging for sensitive operations
 */
export class SecurityAudit {
  static logSecurityEvent(event: {
    userId?: number | string;
    adminId?: number;
    action: string;
    resource: string;
    ip: string;
    userAgent: string;
    success: boolean;
    details?: any;
  }) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...event,
      details: event.details ? JSON.stringify(event.details) : undefined
    };
    
    console.log('SECURITY_AUDIT:', JSON.stringify(logEntry));
    
    // In production, you would store this in a secure audit log database
    // or send to a security monitoring service
  }
}

/**
 * IP whitelist for admin operations (optional)
 */
export const adminIPWhitelist = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const allowedIPs = process.env.ADMIN_IP_WHITELIST?.split(',') || [];
  
  // Skip IP checking in development
  if (process.env.NODE_ENV === 'development' || allowedIPs.length === 0) {
    return next();
  }
  
  if (!allowedIPs.includes(clientIP)) {
    SecurityAudit.logSecurityEvent({
      action: 'ADMIN_ACCESS_DENIED',
      resource: req.path,
      ip: clientIP,
      userAgent: req.headers['user-agent'] || '',
      success: false,
      details: { reason: 'IP not whitelisted' }
    });
    
    return res.status(403).json({ 
      message: 'Access denied from this IP address' 
    });
  }
  
  next();
};