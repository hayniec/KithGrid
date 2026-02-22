import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL is missing. Please ensure DATABASE_URL or NETLIFY_DATABASE_URL is set.');
}

const pool = new Pool({
    connectionString,
});

export const db = drizzle(pool, { schema });
