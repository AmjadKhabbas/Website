// Configuration file for cPanel deployment
// Replace these values with your actual production values

module.exports = {
  // Database Configuration - REQUIRED
  // Format: postgresql://username:password@host:port/database_name
  // Example: postgresql://medsgo_user:mypassword@localhost:5432/medsgo_database
  DATABASE_URL: "postgresql://username:password@host:port/database_name",
  
  // Session Configuration - REQUIRED
  // Generate a random string for security
  SESSION_SECRET: "meds-go-super-secret-session-key-change-this-to-random-string-2024",
  
  // Email Configuration (Gmail SMTP) - OPTIONAL
  // Used for user registration confirmations and notifications
  GMAIL_USER: "your-email@gmail.com",
  GMAIL_APP_PASSWORD: "your-gmail-app-password",
  
  // Stripe Configuration - OPTIONAL (for payments)
  // Get these from https://dashboard.stripe.com/apikeys
  STRIPE_SECRET_KEY: "sk_live_your_stripe_secret_key_here",
  VITE_STRIPE_PUBLIC_KEY: "pk_live_your_stripe_public_key_here",
  
  // Environment
  NODE_ENV: "production",
  PORT: 3000,
  
  // Application URLs
  BASE_URL: "https://yourdomain.com",
  
  // File Upload Settings
  MAX_FILE_SIZE: "50mb",
  UPLOAD_PATH: "./uploads",
  
  // Admin Account Settings
  DEFAULT_ADMIN_EMAIL: "admin@meds-go.com",
  DEFAULT_ADMIN_PASSWORD: "admin123", // CHANGE THIS IMMEDIATELY
  DEFAULT_ADMIN_NAME: "System Administrator"
};