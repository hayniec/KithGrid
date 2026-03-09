'use server'

import { db } from "@/db";
import { communities } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Type definition matching the UI but mapped from DB
export type CommunityActionState =
    | { success: true; data: any }
    | { success: false; error: string };

// Map DB row to UI Community type
// Map DB row to UI Community type
const mapToUI = (row: any) => {
    const mapped = {
        id: row.id,
        name: row.name,
        slug: row.slug || '',
        plan: row.planTuple || 'starter_100',
        features: {
            marketplace: row.hasMarketplace,
            resources: row.hasResources,
            events: row.hasEvents,
            documents: row.hasDocuments,
            forum: row.hasForum,
            messages: row.hasMessages,
            services: row.hasServicePros,

            local: row.hasLocalGuide,
            emergency: row.hasEmergency,
        },
        isActive: row.isActive,
        archivedAt: row.archivedAt ? new Date(row.archivedAt).toISOString() : null,
        branding: {
            logoUrl: row.logoUrl || '',
            primaryColor: row.primaryColor || '#4f46e5',
            secondaryColor: row.secondaryColor || '#1e1b4b',
            accentColor: row.accentColor || '#f59e0b',
        },
        emergency: {
            accessCode: row.emergencyAccessCode || '',
            instructions: row.emergencyInstructions || ''
        },
        hoaSettings: {
            duesAmount: row.hoaDuesAmount || null,
            duesFrequency: row.hoaDuesFrequency || 'Monthly',
            duesDate: row.hoaDuesDate || '1st',
            contactEmail: row.hoaContactEmail || ''
        },
        hoaExtendedSettings: row.hoaExtendedSettings || null,
        billing: {
            maxHomes: row.maxHomes || 100,
            trialEndsAt: row.trialEndsAt ? new Date(row.trialEndsAt).toISOString() : null,
            planStatus: row.planStatus || 'active',
        }
    };
    return mapped;
};


import { members, users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";

export async function getCommunities() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        console.log("[getCommunities] Session check:", {
            hasSession: !!user,
            hasUser: !!user,
            hasUserId: !!user?.id,
            userId: user?.id,
            userEmail: user?.email
        });

        if (!user?.id) {
            console.error("[getCommunities] UNAUTHORIZED: No valid session found");
            return { success: false, error: "Unauthorized" };
        }

        console.log("[getCommunities] Fetching communities for user:", user.email);

        if (!user.email) {
            return { success: false, error: "Unauthorized: No email found in session" };
        }

        // Cross-reference DB user by email
        const [dbUser] = await db.select().from(users).where(eq(users.email, user.email));
        if (!dbUser) {
            console.error("[getCommunities] DB user not found for email:", user.email);
            return { success: false, error: "Database user not found" };
        }

        const userId = dbUser.id;

        // Fetch user's communities via membership
        // Use a base select without billing columns (trial_ends_at, plan_status)
        // which may not exist if the billing migration hasn't been run yet.
        const baseSelect = {
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            planTuple: communities.planTuple,
            hasMarketplace: communities.hasMarketplace,
            hasResources: communities.hasResources,
            hasEvents: communities.hasEvents,
            hasDocuments: communities.hasDocuments,
            hasForum: communities.hasForum,
            hasMessages: communities.hasMessages,
            hasServicePros: communities.hasServicePros,
            hasLocalGuide: communities.hasLocalGuide,
            hasEmergency: communities.hasEmergency,
            isActive: communities.isActive,
            logoUrl: communities.logoUrl,
            primaryColor: communities.primaryColor,
            secondaryColor: communities.secondaryColor,
            accentColor: communities.accentColor,
            emergencyAccessCode: communities.emergencyAccessCode,
            emergencyInstructions: communities.emergencyInstructions,
            hoaDuesAmount: communities.hoaDuesAmount,
            hoaDuesFrequency: communities.hoaDuesFrequency,
            hoaDuesDate: communities.hoaDuesDate,
            hoaContactEmail: communities.hoaContactEmail,
            hoaExtendedSettings: communities.hoaExtendedSettings,
            maxHomes: communities.maxHomes,
        };

        let userCommunities;
        try {
            // Try with billing columns first; exclude archived communities
            userCommunities = await db
                .select({ ...baseSelect, trialEndsAt: communities.trialEndsAt, planStatus: communities.planStatus })
                .from(communities)
                .innerJoin(members, eq(communities.id, members.communityId))
                .where(and(eq(members.userId, userId), isNull(communities.archivedAt)));
        } catch {
            // Fallback without billing columns if migration hasn't run
            console.warn("[getCommunities] Billing columns not found, falling back without them");
            userCommunities = await db
                .select(baseSelect)
                .from(communities)
                .innerJoin(members, eq(communities.id, members.communityId))
                .where(and(eq(members.userId, userId), isNull(communities.archivedAt)));
        }

        console.log(`[getCommunities] Found ${userCommunities.length} communities.`);
        return { success: true, data: userCommunities.map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch communities:", error);
        return { success: false, error: "Failed to fetch communities" };
    }
}



export async function createCommunity(data: any): Promise<CommunityActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized: No user session found" };
        }

        return await db.transaction(async (tx) => {
            // 1. Create Community
            const [inserted] = await tx.insert(communities).values({
                name: data.name,
                slug: data.slug,
                planTuple: data.plan,
                hasMarketplace: data.features.marketplace,
                hasResources: data.features.resources,
                hasEvents: data.features.events,
                hasDocuments: data.features.documents,
                hasForum: data.features.forum,
                hasMessages: data.features.messages,
                hasServicePros: data.features.services,
                hasLocalGuide: data.features.local,
                hasEmergency: data.features.emergency,
                isActive: true,
                primaryColor: data.branding?.primaryColor,
                secondaryColor: data.branding?.secondaryColor,
                accentColor: data.branding?.accentColor,
                logoUrl: data.branding?.logoUrl || null,
                planStatus: 'active' as const,
            }).returning();

            if (!inserted) {
                throw new Error("Failed to insert community record");
            }

            // 2. Add Creator as Admin
            await tx.insert(members).values({
                userId: user.id,
                communityId: inserted.id,
                role: 'Admin',
                address: 'Admin Address',
                joinedDate: new Date(),
                isOnline: true
            });

            return { success: true, data: mapToUI(inserted) };
        });

    } catch (error: any) {
        console.error("Failed to create community:", error);
        console.error("Error details:", { code: error.code, detail: error.detail, hint: error.hint, where: error.where });

        if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
            return { success: false, error: "A tenant with this slug already exists. Please choose a distinct slug." };
        }

        // Extract the actual Postgres error from Drizzle's wrapped message
        const msg = error.message || "";
        const pgError = msg.split('\n')[0] || msg;

        // Check for missing column errors (schema/migration mismatch)
        if (error.code === '42703' || msg.includes('column') && msg.includes('does not exist')) {
            const colMatch = msg.match(/column "([^"]+)"/);
            const colName = colMatch ? colMatch[1] : 'unknown';
            return { success: false, error: `Database column "${colName}" is missing. Run the migration: db/migrations/add_missing_columns.sql` };
        }

        // Foreign key violation (e.g. user doesn't exist in users table)
        if (error.code === '23503') {
            return { success: false, error: `Foreign key error: ${error.detail || pgError}. The logged-in user may not exist in the users table.` };
        }

        return { success: false, error: `Failed to create community: ${pgError}` };
    }
}

export async function toggleCommunityStatus(id: string, newStatus: boolean) {
    try {
        await db.update(communities)
            .set({ isActive: newStatus })
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteCommunity(id: string) {
    try {
        // Soft-delete: archive instead of permanently removing
        await db.update(communities)
            .set({ archivedAt: new Date() })
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to archive community" };
    }
}

export async function restoreCommunity(id: string) {
    try {
        await db.update(communities)
            .set({ archivedAt: null })
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to restore community" };
    }
}

export async function permanentlyDeleteCommunity(id: string) {
    try {
        await db.delete(communities).where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to permanently delete community" };
    }
}

export async function toggleCommunityFeature(id: string, featureKey: string, newValue: boolean) {
    const columnMap: Record<string, any> = {
        marketplace: { hasMarketplace: newValue },
        resources: { hasResources: newValue },
        events: { hasEvents: newValue },
        documents: { hasDocuments: newValue },
        forum: { hasForum: newValue },
        messages: { hasMessages: newValue },
        services: { hasServicePros: newValue },

        local: { hasLocalGuide: newValue },
        emergency: { hasEmergency: newValue }
    };

    if (!columnMap[featureKey]) return { success: false, error: "Invalid feature key" };

    try {
        await db.update(communities)
            .set(columnMap[featureKey])
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to toggle feature" };
    }
}

export async function updateCommunityBranding(id: string, branding: any) {
    try {
        await db.update(communities).set({
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor,
            logoUrl: branding.logoUrl
        }).where(eq(communities.id, id));
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed update branding" };
    }
}

export async function updateEmergencySettings(id: string, data: { accessCode: string; instructions: string }) {
    try {
        await db.update(communities).set({
            emergencyAccessCode: data.accessCode,
            emergencyInstructions: data.instructions
        }).where(eq(communities.id, id));
        return { success: true };
    } catch (e) {
        console.error("Failed to update emergency settings", e);
        return { success: false, error: "Failed to update emergency settings" };
    }
}

export async function updateCommunityHoaSettings(id: string, data: { duesAmount: string; duesFrequency: string; duesDate: string; contactEmail: string }) {
    try {
        // Parse duesAmount - if empty or invalid, store null
        let amount: string | null = null;
        if (data.duesAmount && data.duesAmount.trim() !== '') {
            const parsed = parseFloat(data.duesAmount);
            if (!isNaN(parsed)) {
                amount = parsed.toFixed(2);
            }
        }

        console.log('[updateCommunityHoaSettings] Saving amount:', amount, 'from input:', data.duesAmount);

        await db.update(communities).set({
            hoaDuesAmount: amount,
            hoaDuesFrequency: data.duesFrequency,
            hoaDuesDate: data.duesDate,
            hoaContactEmail: data.contactEmail
        }).where(eq(communities.id, id));

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/admin');

        return { success: true };
    } catch (e) {
        console.error("Failed to update HOA settings", e);
        return { success: false, error: "Failed to update HOA settings" };
    }
}

export async function updateHoaExtendedSettings(id: string, data: { amenities?: any[]; rules?: any[]; vendors?: any[] }) {
    try {
        await db.update(communities).set({
            hoaExtendedSettings: data
        }).where(eq(communities.id, id));

        revalidatePath('/dashboard/hoa');
        revalidatePath('/dashboard/admin');

        return { success: true };
    } catch (e) {
        console.error("Failed to update HOA extended settings", e);
        return { success: false, error: "Failed to update HOA extended settings" };
    }
}

/**
 * Fetch community by ID without session check
 * Used when we already have the communityId from client context
 */
export async function getCommunityById(id: string) {
    try {
        const baseSelect = {
            id: communities.id,
            name: communities.name,
            slug: communities.slug,
            planTuple: communities.planTuple,
            hasMarketplace: communities.hasMarketplace,
            hasResources: communities.hasResources,
            hasEvents: communities.hasEvents,
            hasDocuments: communities.hasDocuments,
            hasForum: communities.hasForum,
            hasMessages: communities.hasMessages,
            hasServicePros: communities.hasServicePros,
            hasLocalGuide: communities.hasLocalGuide,
            hasEmergency: communities.hasEmergency,
            isActive: communities.isActive,
            logoUrl: communities.logoUrl,
            primaryColor: communities.primaryColor,
            secondaryColor: communities.secondaryColor,
            accentColor: communities.accentColor,
            emergencyAccessCode: communities.emergencyAccessCode,
            emergencyInstructions: communities.emergencyInstructions,
            hoaDuesAmount: communities.hoaDuesAmount,
            hoaDuesFrequency: communities.hoaDuesFrequency,
            hoaDuesDate: communities.hoaDuesDate,
            hoaContactEmail: communities.hoaContactEmail,
            hoaExtendedSettings: communities.hoaExtendedSettings,
            maxHomes: communities.maxHomes,
        };

        let community;
        try {
            [community] = await db
                .select({ ...baseSelect, trialEndsAt: communities.trialEndsAt, planStatus: communities.planStatus })
                .from(communities)
                .where(eq(communities.id, id));
        } catch {
            [community] = await db
                .select(baseSelect)
                .from(communities)
                .where(eq(communities.id, id));
        }

        if (!community) {
            return { success: false, error: "Community not found" };
        }

        return { success: true, data: mapToUI(community) };
    } catch (error: any) {
        console.error("Failed to fetch community by ID:", error);
        return { success: false, error: "Failed to fetch community" };
    }
}
