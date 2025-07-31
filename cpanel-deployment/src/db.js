// Database configuration for cPanel deployment
const { neon, neonConfig } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const config = require('../config.js');

// Disable WebAssembly to prevent memory issues on shared hosting
neonConfig.webAssembly = false;

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in config.js. Please update your database connection string.");
}

console.log('Connecting to database...');

// Create database connection
const client = neon(config.DATABASE_URL);
const db = drizzle(client);

module.exports = { db, client };