// MySQL database configuration for cPanel deployment
const mysql = require('mysql2/promise');
const { drizzle } = require('drizzle-orm/mysql2');
const config = require('../config.js');

// MySQL connection configuration
let connectionConfig;

if (config.DATABASE_URL) {
  // Parse DATABASE_URL format: mysql://user:password@host:port/database
  const url = new URL(config.DATABASE_URL);
  connectionConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: false,
  };
} else {
  // Individual environment variables (cPanel style)
  connectionConfig = {
    host: config.DB_HOST || 'localhost',
    port: parseInt(config.DB_PORT || '3306'),
    user: config.DB_USER || '',
    password: config.DB_PASSWORD || '',
    database: config.DB_NAME || '',
    ssl: false,
  };
}

if (!connectionConfig.user || !connectionConfig.database) {
  throw new Error("MySQL credentials must be set in config.js. Check DATABASE_URL or individual DB_* variables.");
}

console.log('Connecting to MySQL database:', {
  host: connectionConfig.host,
  port: connectionConfig.port,
  database: connectionConfig.database,
  user: connectionConfig.user
});

// Create MySQL connection pool
const connection = mysql.createPool(connectionConfig);

// Create Drizzle instance with MySQL adapter
const db = drizzle(connection, { mode: 'default' });

module.exports = { db, connection };