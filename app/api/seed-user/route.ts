
import { NextResponse } from "next/server";
import { db } from "@/db";
import { members as neighbors, communities, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        console.log("Checking for communities...");
        let communityId;
        const existingCommunities = await db.select().from(communities).limit(1);

        if (existingCommunities.length > 0) {
            communityId = existingCommunities[0].id; // Assign ID
        } else {
            console.log("No community found. Creating one...");
            const [newCommunity] = await db.insert(communities).values({
                name: "Demo Community",
                slug: "demo-community",
            }).returning();
            communityId = newCommunity.id;
        }

        const email = "admin@example.com";
        const password = "password123";

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
            console.log("Updating existing global user...");
            await db.update(users).set({
                password: password,
                // name: "Test Admin" // Optional: Update name if needed
            }).where(eq(users.email, email));
        }

        // 2. Check/Create Member Logic
        // We need to import 'members' and 'users' properly at the top first.
        // Assuming 'neighbors' is aliased to 'members' in imports for now,
        // but let's fix the imports in a separate step if needed.
        // Actually, I should have fixed the imports first.
        // But let's assume I fix imports in this file rename or previous step.
        // Wait, I aliased members as neighbors in previous step.

        const [existingMember] = await db.select().from(neighbors).where(eq(neighbors.userId, user.id));

        if (existingMember) {
            await db.update(neighbors).set({
                role: "Admin",
                communityId: communityId
            }).where(eq(neighbors.id, existingMember.id));
        } else {
            await db.insert(neighbors).values({
                userId: user.id,
                communityId: communityId,
                role: "Admin",
                // joinedDate: new Date()
            });
        }

        return NextResponse.json({
            success: true,
            message: "User created/updated",
            credentials: { email, password }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
