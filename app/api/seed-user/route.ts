
import { NextResponse } from "next/server";
import { db } from "@/db";
import { neighbors, communities } from "@/db/schema";
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

        const existingUser = await db.select().from(neighbors).where(eq(neighbors.email, email));

        if (existingUser.length > 0) {
            await db.update(neighbors).set({
                password: password,
                role: "Admin",
                communityId: communityId
            }).where(eq(neighbors.email, email));
        } else {
            await db.insert(neighbors).values({
                name: "Test Admin",
                email: email,
                password: password,
                role: "Admin",
                communityId: communityId,
                avatar: "TA"
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
