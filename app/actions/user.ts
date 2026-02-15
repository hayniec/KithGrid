
'use server'

import { db } from "@/db";
import { users, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfile(userId: string) {
    try {
        console.log("[getUserProfile] Fetching for userId:", userId);

        // Fetch User
        const [dbUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!dbUser) return { success: false, error: "User not found" };

        // Fetch Membership (First one found)
        const [membership] = await db
            .select()
            .from(members)
            .where(eq(members.userId, userId));

        if (!membership) {
            console.log("[getUserProfile] User has no memberships.");
            return {
                success: true,
                data: {
                    ...dbUser,
                    communityId: null,
                    role: 'resident'
                }
            };
        }

        console.log("[getUserProfile] Found membership:", membership);

        return {
            success: true,
            data: {
                ...dbUser,
                communityId: membership.communityId,
                role: membership.role
            }
        };

    } catch (e: any) {
        console.error("Failed to get user profile", e);
        return { success: false, error: e.message };
    }
}
