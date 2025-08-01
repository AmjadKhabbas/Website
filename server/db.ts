import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

console.log('Connecting to PostgreSQL database...');

// Create PostgreSQL connection
const connection = postgres(process.env.DATABASE_URL, {
  ssl: 'require'
});

// Create Drizzle instance with PostgreSQL adapter
export const db = drizzle(connection, { schema });