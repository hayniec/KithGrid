
import { config } from "dotenv";
import fs from "fs";
import path from "path";

// Manually load .env.local because imports are hoisted
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = config({ path: envPath });
    if (envConfig.error) {
        console.error("Error loading .env.local", envConfig.error);
    }
}

async function run() {
    // Dynamic import to ensure env is loaded first
    const { db } = await import("@/db");
    const { sql } = await import("drizzle-orm");

    try {
        console.log("Adding invited_name column to invitations table...");
        // Use raw query
        await db.execute(sql.raw("ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invited_name text;"));
        console.log("Column added successfully or already exists.");
    } catch (error) {
        console.error("Error adding column:", error);
    } finally {
        process.exit(0);
    }
}

run();
