
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
    // Dynamic imports
    const { db } = await import("@/db");
    const { users, members, communities } = await import("@/db/schema");

    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error("Usage: npx tsx scripts/create_user.ts <email> <name> <community-slug> [password]");
        process.exit(1);
    }

    const [email, name, communitySlug, password = "password123"] = args;

    try {
        console.log(`Creating user '${name}' (${email}) in community '${communitySlug}'...`);

        // 1. Find Community
        let [community] = await db.select().from(communities).where(eq(communities.slug, communitySlug));
        if (!community) {
            console.error(`Error: Community '${communitySlug}' not found.`);
            // List available?
            const allComs = await db.select().from(communities);
            console.log("Available communities:", allComs.map(c => c.slug).join(", "));
            process.exit(1);
        }

        // 2. Upsert Global User
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            [user] = await db.insert(users).values({
                email,
                name,
                password // Note: Plain text for dev
            }).returning();
            console.log(`✅ Global user created: ${user.id}`);
        } else {
            console.log(`ℹ️ Global user already exists: ${user.id}`);
        }

        // 3. Add Membership
        const [existingMember] = await db.select().from(members).where(eq(members.userId, user.id));
        // Check if member of THIS community specifically would require importing 'and' or filter.
        // For simplicity, let's just insert and catch error or check first.

        // Let's actually check properly
        const memberships = await db.select().from(members).where(eq(members.userId, user.id));
        const isMember = memberships.some(m => m.communityId === community.id);

        if (!isMember) {
            await db.insert(members).values({
                userId: user.id,
                communityId: community.id,
                role: "Resident"
            });
            console.log(`✅ Membership added to '${community.name}'`);
        } else {
            console.log(`ℹ️ Already a member of '${community.name}'`);
        }

        console.log("\nSuccess! You can now log in with:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error("Failed to create user:", error);
    } finally {
        process.exit(0);
    }
}

main();
