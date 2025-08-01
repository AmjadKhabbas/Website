import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// MySQL connection configuration
let connectionConfig;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL format: mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  connectionConfig = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
  };
} else {
  // Individual environment variables (cPanel style)
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
  };
}

if (!connectionConfig.user || !connectionConfig.database) {
  throw new Error("Database credentials must be set. Check DATABASE_URL or individual DB_* variables.");
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
export const db = drizzle(connection, { schema, mode: 'default' });