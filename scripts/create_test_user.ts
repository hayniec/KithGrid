
import { db } from "@/db";
import { members as neighbors, communities, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function createTestUser() {
    console.log("Checking for communities...");
    let communityId;
    const existingCommunities = await db.select().from(communities).limit(1);

    if (existingCommunities.length > 0) {
        communityId = existingCommunities[0].id;
        console.log(`Found existing community: ${existingCommunities[0].name} (${communityId})`);
    } else {
        console.log("No community found. Creating one...");
        const [newCommunity] = await db.insert(communities).values({
            name: "Demo Community",
            slug: "demo-community",
        }).returning();
        communityId = newCommunity.id;
        console.log(`Created new community: ${newCommunity.name} (${communityId})`);
    }

    const email = "admin@example.com";
    const password = "password123";

    console.log(`Checking for user: ${email}...`);
    // 1. Check/Create Global User
    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.log("Creating new global user...");
        [user] = await db.insert(users).values({
            name: "Test Admin",
            email: email,
            password: password,
            avatar: "TA"
        }).returning();
    } else {
        console.log("Global user exists. Updating password...");
        await db.update(users).set({
            password: password
        }).where(eq(users.id, user.id));
    }

    // 2. Check/Upsert Membership
    const [existingMember] = await db.select().from(neighbors).where(eq(neighbors.userId, user.id));

    if (existingMember) {
        console.log("Updating existing membership...");
        await db.update(neighbors).set({
            role: "Admin",
            communityId: communityId
        }).where(eq(neighbors.id, existingMember.id));
    } else {
        console.log("Creating new membership...");
        await db.insert(neighbors).values({
            userId: user.id,
            communityId: communityId,
            role: "Admin"
        });
    }

    console.log("Test user ready!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
}

createTestUser().catch((err) => {
    console.error("Error creating test user:", err);
    process.exit(1);
});
