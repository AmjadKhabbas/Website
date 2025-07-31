// Configuration file for cPanel deployment
// Replace these values with your actual production values

module.exports = {
  // Database Configuration
  DATABASE_URL: "postgresql://username:password@host:port/database_name",
  
  // Session Configuration
  SESSION_SECRET: "your-super-secret-session-key-here-change-this-in-production",
  
  // Email Configuration (Gmail SMTP)
  GMAIL_USER: "your-email@gmail.com",
  GMAIL_APP_PASSWORD: "your-gmail-app-password",
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: "sk_live_your_stripe_secret_key_here",
  VITE_STRIPE_PUBLIC_KEY: "pk_live_your_stripe_public_key_here",
  
  // Environment
  NODE_ENV: "production",
  PORT: 3000,
  
  // Application URLs
  BASE_URL: "https://yourdomain.com",
  
  // Other settings
  MAX_FILE_SIZE: "50mb",
  UPLOAD_PATH: "./uploads"
};