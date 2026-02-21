import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL must be set");

const client = neon(databaseUrl);
const db = drizzle(client);

async function main() {
    console.log("Fixing roles arrays in the database...");

    try {
        await db.execute(sql`
            UPDATE neighbors 
            SET roles = ARRAY[role] 
            WHERE role IS NOT NULL 
              AND (roles IS NULL OR array_length(roles, 1) = 0 OR roles[1] != role);
        `);
        console.log("Successfully fixed roles");
    } catch (error) {
        console.error("Failed to update:", error);
    }
}

main();
