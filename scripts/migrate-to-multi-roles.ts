
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL!;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function main() {
    console.log("Starting migration to multi-roles...");

    try {
        // 1. Add 'roles' column if not exists
        console.log("Adding 'roles' column...");
        await db.execute(sql`
            ALTER TABLE neighbors 
            ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['Resident'];
        `);

        // 2. Populate 'roles' from existing 'role' column
        console.log("Migrating existing data...");
        // This will overwrite roles if executed again, but that's okay for initial migration
        // Or check if roles is Default
        await db.execute(sql`
            UPDATE neighbors 
            SET roles = ARRAY[role] 
            WHERE role IS NOT NULL;
        `);

        // 3. Handle NULL roles (fall back to Resident)
        await db.execute(sql`
            UPDATE neighbors 
            SET roles = ARRAY['Resident'] 
            WHERE role IS NULL;
        `);

        console.log("Migration complete!");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

main();
