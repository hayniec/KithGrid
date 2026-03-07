'use server'

import { db } from "@/db";
import { communities, members, forumPosts, events, marketplaceItems, directMessages, invitations } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";

// Plan definitions
export const PLANS = {
    starter_100: { name: 'Starter', maxHomes: 100, features: 'all' },
    growth_250: { name: 'Growth', maxHomes: 250, features: 'all' },
    pro_500: { name: 'Pro', maxHomes: 500, features: 'all' },
} as const;

export type PlanId = keyof typeof PLANS;

// ─── 5.2: Plan Enforcement (Max Homes) ───

export async function checkMemberLimit(communityId: string): Promise<{
    allowed: boolean;
    currentCount: number;
    maxHomes: number;
    plan: string;
}> {
    try {
        const [community] = await db
            .select({
                maxHomes: communities.maxHomes,
                planTuple: communities.planTuple,
                planStatus: communities.planStatus,
                trialEndsAt: communities.trialEndsAt,
            })
            .from(communities)
            .where(eq(communities.id, communityId));

        if (!community) {
            return { allowed: false, currentCount: 0, maxHomes: 0, plan: 'unknown' };
        }

        // Check trial expiration
        if (community.planStatus === 'trial' && community.trialEndsAt) {
            if (new Date(community.trialEndsAt) < new Date()) {
                return {
                    allowed: false,
                    currentCount: 0,
                    maxHomes: community.maxHomes || 100,
                    plan: community.planTuple || 'starter_100',
                };
            }
        }

        // Check if plan is expired/cancelled
        if (community.planStatus === 'expired' || community.planStatus === 'cancelled') {
            return {
                allowed: false,
                currentCount: 0,
                maxHomes: community.maxHomes || 100,
                plan: community.planTuple || 'starter_100',
            };
        }

        const [result] = await db
            .select({ count: count() })
            .from(members)
            .where(eq(members.communityId, communityId));

        const currentCount = result?.count || 0;
        const maxHomes = community.maxHomes || 100;

        return {
            allowed: currentCount < maxHomes,
            currentCount,
            maxHomes,
            plan: community.planTuple || 'starter_100',
        };
    } catch (error) {
        console.error("Failed to check member limit:", error);
        return { allowed: false, currentCount: 0, maxHomes: 0, plan: 'unknown' };
    }
}

// ─── 5.3: Plan Upgrade/Downgrade ───

export async function updateCommunityPlan(communityId: string, newPlan: PlanId) {
    try {
        const planConfig = PLANS[newPlan];
        if (!planConfig) {
            return { success: false, error: "Invalid plan" };
        }

        // Get current member count to prevent downgrade below current usage
        const [result] = await db
            .select({ count: count() })
            .from(members)
            .where(eq(members.communityId, communityId));

        const currentCount = result?.count || 0;
        if (currentCount > planConfig.maxHomes) {
            return {
                success: false,
                error: `Cannot downgrade: you have ${currentCount} members but ${planConfig.name} only allows ${planConfig.maxHomes}. Remove members first.`
            };
        }

        await db.update(communities).set({
            planTuple: newPlan,
            maxHomes: planConfig.maxHomes,
            planStatus: 'active',
        }).where(eq(communities.id, communityId));

        return { success: true, plan: newPlan, maxHomes: planConfig.maxHomes };
    } catch (error: any) {
        console.error("Failed to update plan:", error);
        return { success: false, error: "Failed to update plan" };
    }
}

// ─── 5.4: Usage Tracking Stats ───

export type CommunityUsageStats = {
    communityId: string;
    communityName: string;
    slug: string;
    plan: string;
    planStatus: string;
    maxHomes: number;
    trialEndsAt: string | null;
    memberCount: number;
    postCount: number;
    eventCount: number;
    listingCount: number;
    messageCount: number;
    invitationCount: number;
    usagePercent: number;
};

export async function getAllCommunityUsageStats(): Promise<{
    success: boolean;
    data?: CommunityUsageStats[];
    totals?: { communities: number; members: number; posts: number; events: number; listings: number; messages: number };
    error?: string;
}> {
    try {
        const allCommunities = await db.select({
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            planTuple: communities.planTuple,
            planStatus: communities.planStatus,
            maxHomes: communities.maxHomes,
            trialEndsAt: communities.trialEndsAt,
            isActive: communities.isActive,
        }).from(communities);

        const stats: CommunityUsageStats[] = [];
        let totalMembers = 0, totalPosts = 0, totalEvents = 0, totalListings = 0, totalMessages = 0;

        for (const comm of allCommunities) {
            const [memberResult] = await db.select({ count: count() }).from(members).where(eq(members.communityId, comm.id));
            const [postResult] = await db.select({ count: count() }).from(forumPosts).where(eq(forumPosts.communityId, comm.id));
            const [eventResult] = await db.select({ count: count() }).from(events).where(eq(events.communityId, comm.id));
            const [listingResult] = await db.select({ count: count() }).from(marketplaceItems).where(eq(marketplaceItems.communityId, comm.id));
            const [inviteResult] = await db.select({ count: count() }).from(invitations).where(eq(invitations.communityId, comm.id));

            // Messages are member-scoped not community-scoped, so count via members
            const communityMemberIds = await db.select({ id: members.id }).from(members).where(eq(members.communityId, comm.id));
            let msgCount = 0;
            if (communityMemberIds.length > 0) {
                const memberIdList = communityMemberIds.map(m => m.id);
                const [msgResult] = await db.select({ count: count() }).from(directMessages)
                    .where(sql`${directMessages.senderId} = ANY(${memberIdList})`);
                msgCount = msgResult?.count || 0;
            }

            const memberCount = memberResult?.count || 0;
            const maxHomes = comm.maxHomes || 100;

            stats.push({
                communityId: comm.id,
                communityName: comm.name,
                slug: comm.slug || '',
                plan: comm.planTuple || 'starter_100',
                planStatus: comm.planStatus || 'trial',
                maxHomes,
                trialEndsAt: comm.trialEndsAt ? new Date(comm.trialEndsAt).toISOString() : null,
                memberCount,
                postCount: postResult?.count || 0,
                eventCount: eventResult?.count || 0,
                listingCount: listingResult?.count || 0,
                messageCount: msgCount,
                invitationCount: inviteResult?.count || 0,
                usagePercent: maxHomes > 0 ? Math.round((memberCount / maxHomes) * 100) : 0,
            });

            totalMembers += memberCount;
            totalPosts += postResult?.count || 0;
            totalEvents += eventResult?.count || 0;
            totalListings += listingResult?.count || 0;
            totalMessages += msgCount;
        }

        return {
            success: true,
            data: stats,
            totals: {
                communities: allCommunities.length,
                members: totalMembers,
                posts: totalPosts,
                events: totalEvents,
                listings: totalListings,
                messages: totalMessages,
            }
        };
    } catch (error: any) {
        console.error("Failed to get usage stats:", error);
        return { success: false, error: "Failed to fetch usage stats" };
    }
}

// ─── 5.5: Free Trial Logic ───

export async function getCommunityTrialStatus(communityId: string): Promise<{
    success: boolean;
    data?: {
        planStatus: string;
        trialEndsAt: string | null;
        daysRemaining: number | null;
        isTrialExpired: boolean;
        isActive: boolean;
    };
    error?: string;
}> {
    try {
        const [community] = await db.select({
            planStatus: communities.planStatus,
            trialEndsAt: communities.trialEndsAt,
            isActive: communities.isActive,
        }).from(communities).where(eq(communities.id, communityId));

        if (!community) {
            return { success: false, error: "Community not found" };
        }

        let daysRemaining: number | null = null;
        let isTrialExpired = false;

        if (community.planStatus === 'trial' && community.trialEndsAt) {
            const now = new Date();
            const trialEnd = new Date(community.trialEndsAt);
            const diff = trialEnd.getTime() - now.getTime();
            daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
            isTrialExpired = diff <= 0;
        }

        const isActive = community.planStatus === 'active' ||
            (community.planStatus === 'trial' && !isTrialExpired);

        return {
            success: true,
            data: {
                planStatus: community.planStatus || 'trial',
                trialEndsAt: community.trialEndsAt ? new Date(community.trialEndsAt).toISOString() : null,
                daysRemaining,
                isTrialExpired,
                isActive,
            }
        };
    } catch (error: any) {
        console.error("Failed to get trial status:", error);
        return { success: false, error: "Failed to get trial status" };
    }
}

export async function activateCommunityPlan(communityId: string) {
    try {
        await db.update(communities).set({
            planStatus: 'active',
        }).where(eq(communities.id, communityId));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to activate plan" };
    }
}
