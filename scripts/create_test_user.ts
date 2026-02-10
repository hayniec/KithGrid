
import { db } from "@/db";
import { neighbors, communities } from "@/db/schema";
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
    const existingUser = await db.select().from(neighbors).where(eq(neighbors.email, email));

    if (existingUser.length > 0) {
        console.log("User already exists. Updating password and role...");
        await db.update(neighbors).set({
            password: password,
            role: "Admin",
            communityId: communityId
        }).where(eq(neighbors.email, email));
    } else {
        console.log("Creating new test user...");
        await db.insert(neighbors).values({
            name: "Test Admin",
            email: email,
            password: password,
            role: "Admin",
            communityId: communityId,
            avatar: "TA"
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
