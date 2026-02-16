
console.log("Script starting...");
import fs from "fs";
import path from "path";

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
        console.log("Loading .env from", envPath);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.error("Error loading .env", e);
}

// Also try .env.local
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        console.log("Loading .env.local from", envPath);
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error loading .env.local", e);
}

console.log("Config done.");

const main = async () => {
    console.log("⚠ WARNING: Wiping database completely...");

    // Dynamic import to ensure env is loaded first
    const { db } = await import("../db");
    const schema = await import("../db/schema");

    try {
        // Delete in dependency order (reverse topological sort)

        console.log("Deleting dependent tables...");
        await db.delete(schema.invitations);
        await db.delete(schema.eventRsvps);
        await db.delete(schema.forumLikes);
        await db.delete(schema.forumComments);
        await db.delete(schema.directMessages);

        console.log("Deleting content tables...");
        await db.delete(schema.forumPosts);
        await db.delete(schema.events);
        await db.delete(schema.resources);
        await db.delete(schema.documents);
        await db.delete(schema.marketplaceItems);
        await db.delete(schema.serviceProviders);
        await db.delete(schema.announcements);
        await db.delete(schema.localPlaces);

        console.log("Deleting core tables...");
        await db.delete(schema.members);
        await db.delete(schema.communities);

        console.log("Deleting users...");
        await db.delete(schema.users);

        console.log("✅ Database reset complete. The next login (e.g. via Master Key or Google) will recreate the Super Admin user.");
    } catch (error) {
        console.error("❌ Error resetting database:", error);
        process.exit(1);
    }
    process.exit(0);
};

main();
