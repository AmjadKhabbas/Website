// Main entry point for cPanel deployment
const config = require('./config.js');

// Set environment variables from config
Object.keys(config).forEach(key => {
  process.env[key] = config[key];
});

// Neon WebAssembly configuration
const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webAssembly = false;

// Import and start the main application
require('./dist/index.js');