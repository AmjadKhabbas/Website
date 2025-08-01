import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please check your environment variables.");
}

console.log('Connecting to PostgreSQL database:', {
  url: process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') // Hide password in logs
});

// Create PostgreSQL connection
const connection = postgres(process.env.DATABASE_URL);

// Create Drizzle instance with PostgreSQL adapter
export const db = drizzle(connection, { schema });