'use server'

import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getUserProfile(userId: string) {
    try {
        console.log("[getUserProfile] Fetching for userId:", userId);

        // Fetch User
        const [dbUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!dbUser) return { success: false, error: "User not found" };

        // Fetch Membership (First one found)
        let [membership] = await db
            .select()
            .from(members)
            .where(eq(members.userId, userId));

        if (!membership) {
            console.log("[getUserProfile] User has no memberships.");
            return {
                success: true,
                data: {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    communityId: undefined,
                    role: 'resident'
                }
            };
        }

        console.log("[getUserProfile] Found membership:", membership);

        // SAFE RETURN: Return ONLY simple strings to guarantee no serialization errors (No Date objects!)
        return {
            success: true,
            data: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                communityId: membership.communityId,
                role: membership.role ? membership.role.toLowerCase() : 'resident',
                roles: membership.roles?.map((r: string) => r.toLowerCase()) || [membership.role ? membership.role.toLowerCase() : 'resident']
            }
        };

    } catch (e: any) {
        console.error("Failed to get user profile", e);
        return { success: false, error: `Server Error: ${e.message || String(e)}` };
    }
}

/**
 * Get the user's membership for a specific community.
 * Does NOT delete or modify any memberships.
 */
export async function getMembershipForCommunity(userId: string, communityId: string) {
    try {
        const [membership] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

        if (!membership) {
            return { success: false, error: "No membership found for this community" };
        }

        return {
            success: true,
            data: {
                communityId: membership.communityId,
                role: membership.role ? membership.role.toLowerCase() : 'resident',
            }
        };
    } catch (e: any) {
        console.error("[getMembershipForCommunity] Error:", e);
        return { success: false, error: String(e.message || e) };
    }
}

/**
 * @deprecated Use client-side switchCommunity from UserContext instead.
 * This function is kept for backwards compatibility but no longer deletes memberships.
 */
export async function switchCommunity(userId: string, newCommunityId: string) {
    try {
        console.log(`[switchCommunity] Request: User ${userId} -> Comm ${newCommunityId}`);

        // Verify user exists
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            return { success: false, error: "User ID invalid" };
        }

        // Verify membership exists for the target community
        const [membership] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.communityId, newCommunityId)));

        if (!membership) {
            return { success: false, error: "You are not a member of this community" };
        }

        console.log("[switchCommunity] Verified membership, switch allowed.");
        return { success: true, message: "Switched" };

    } catch (e: any) {
        console.error("[switchCommunity] CRITICAL FAIL:", e);
        return { success: false, error: String(e.message || e) };
    }
}
