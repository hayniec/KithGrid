// Shared billing constants and types (NOT a "use server" file)
// Extracted so they can be imported by both server actions and client components.

export const PLANS = {
    starter_100: { name: 'Starter', maxHomes: 100, features: 'all' },
    growth_250: { name: 'Growth', maxHomes: 250, features: 'all' },
    pro_500: { name: 'Pro', maxHomes: 500, features: 'all' },
} as const;

export type PlanId = keyof typeof PLANS;

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
