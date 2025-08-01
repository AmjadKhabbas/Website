// Configuration for cPanel MySQL deployment
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  },
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'production',
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  },
  
  // Email Configuration
  email: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
  },
  
  // Stripe Configuration (optional)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

export default config;