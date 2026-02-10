
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
    // Dynamic imports to ensure env vars are loaded first
    const { db } = await import("@/db");
    const { users, members, communities } = await import("@/db/schema");
    const { authenticateUser } = await import("@/app/actions/auth");
    const { getNeighbors } = await import("@/app/actions/neighbors");

    console.log("🔒 Starting Isolation Verification Test...\n");

    try {
        // 1. Setup Two Distinct Communities
        console.log("1. Setting up Test Communities...");
        const comA_slug = "test-isolation-a";
        const comB_slug = "test-isolation-b";

        let [comA] = await db.select().from(communities).where(eq(communities.slug, comA_slug));
        if (!comA) {
            [comA] = await db.insert(communities).values({ name: "Isolation Test A", slug: comA_slug }).returning();
            console.log(`   Created Community A: ${comA.name} (${comA.id})`);
        } else {
            console.log(`   Found Community A: ${comA.name} (${comA.id})`);
        }

        let [comB] = await db.select().from(communities).where(eq(communities.slug, comB_slug));
        if (!comB) {
            [comB] = await db.insert(communities).values({ name: "Isolation Test B", slug: comB_slug }).returning();
            console.log(`   Created Community B: ${comB.name} (${comB.id})`);
        } else {
            console.log(`   Found Community B: ${comB.name} (${comB.id})`);
        }

        // 2. Create Distinct Users for each
        console.log("\n2. Creating Test Users...");
        const userA_email = "alice.isolation@test.com";
        const userB_email = "bob.isolation@test.com";

        // Create Alice (Community A)
        let [userA] = await db.select().from(users).where(eq(users.email, userA_email));
        if (!userA) {
            [userA] = await db.insert(users).values({ email: userA_email, name: "Alice A", password: "password123" }).returning();
            await db.insert(members).values({ userId: userA.id, communityId: comA.id, role: "Resident" });
            console.log(`   Created User A (Alice) in Community A`);
        } else {
            console.log(`   Found User A (Alice)`);
        }

        // Create Bob (Community B)
        let [userB] = await db.select().from(users).where(eq(users.email, userB_email));
        if (!userB) {
            [userB] = await db.insert(users).values({ email: userB_email, name: "Bob B", password: "password123" }).returning();
            await db.insert(members).values({ userId: userB.id, communityId: comB.id, role: "Resident" });
            console.log(`   Created User B (Bob) in Community B`);
        } else {
            console.log(`   Found User B (Bob)`);
        }

        // 3. Verify Login & Context Resolution
        console.log("\n3. Verifying Login Context...");

        const authA = await authenticateUser(userA_email, "password123");
        if (authA.success && authA.user?.communityId === comA.id) {
            console.log("   ✅ Alice logged in and received correct Community A context.");
        } else {
            console.error("   ❌ Alice login failed or incorrect context!", authA);
        }

        const authB = await authenticateUser(userB_email, "password123");
        if (authB.success && authB.user?.communityId === comB.id) {
            console.log("   ✅ Bob logged in and received correct Community B context.");
        } else {
            console.error("   ❌ Bob login failed or incorrect context!", authB);
        }

        // 4. Verify Data Siloing (getNeighbors)
        console.log("\n4. Verifying Data Siloing...");

        // Fetch neighbors for Community A
        const neighborsA = await getNeighbors(comA.id);
        const hasAliceInA = neighborsA.data?.some((n: any) => n.email === userA_email);
        const hasBobInA = neighborsA.data?.some((n: any) => n.email === userB_email);

        if (hasAliceInA && !hasBobInA) {
            console.log("   ✅ Community A contains Alice and correctly EXCLUDES Bob.");
        } else {
            console.error("   ❌ Community A isolation failed!");
            console.log("      Contains Alice?", hasAliceInA);
            console.log("      Contains Bob?", hasBobInA);
        }

        // Fetch neighbors for Community B
        const neighborsB = await getNeighbors(comB.id);
        const hasBobInB = neighborsB.data?.some((n: any) => n.email === userB_email);
        const hasAliceInB = neighborsB.data?.some((n: any) => n.email === userA_email);

        if (hasBobInB && !hasAliceInB) {
            console.log("   ✅ Community B contains Bob and correctly EXCLUDES Alice.");
        } else {
            console.error("   ❌ Community B isolation failed!");
            console.log("      Contains Bob?", hasBobInB);
            console.log("      Contains Alice?", hasAliceInB);
        }

    } catch (e) {
        console.error("❌ Test Failed:", e);
    } finally {
        console.log("\n🏁 Verification Complete.");
        process.exit(0);
    }
}

main();
