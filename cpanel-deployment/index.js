// Main entry point for cPanel deployment
// This file loads configuration and starts the Express server

console.log('Starting Meds-Go Medical Marketplace...');

// Load configuration first
const config = require('./config.js');

// Set environment variables from config
Object.keys(config).forEach(key => {
  if (config[key] !== undefined) {
    process.env[key] = config[key].toString();
  }
});

console.log('Configuration loaded successfully');
console.log('Node Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Database configured:', !!process.env.DATABASE_URL);

// MySQL configuration - no special setup needed for mysql2
console.log('MySQL client configured for cPanel hosting');

// Import and start the main application
try {
  console.log('Loading application server...');
  require('./dist/index.js');
} catch (error) {
  console.error('Failed to start application:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}