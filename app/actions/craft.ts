'use server'

import { db } from "@/db";
import { craftIntegrations, documents, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { requireAdminInCommunity } from "@/utils/auth/permissions";
import {
    generateCraftAuthUrl,
    exchangeCraftCode,
    isTokenExpired,
    refreshCraftToken,
    createCraftDocument,
    updateCraftDocument,
    listCraftDocuments,
    getCraftSpaces,
    type CraftAuthToken,
    type CraftSyncConfig,
} from "@/utils/integrations/craft";

export type CraftIntegrationState = {
    success: boolean;
    data?: any;
    error?: string;
    redirectUrl?: string;
};

const CRAFT_CLIENT_ID = process.env.CRAFT_CLIENT_ID!;
const CRAFT_CLIENT_SECRET = process.env.CRAFT_CLIENT_SECRET!;
const CRAFT_REDIRECT_URI = process.env.CRAFT_REDIRECT_URI!;

/**
 * Get Craft OAuth authorization URL
 * User clicks this link to authorize KithGrid to access their Craft workspace
 */
export async function getCraftAuthUrl(communityId: string): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        // Generate authorization URL with CSRF state
        const { url: authUrl, state } = generateCraftAuthUrl(CRAFT_CLIENT_ID, CRAFT_REDIRECT_URI);

        // Store state in a secure HTTP-only cookie for verification in the callback
        const cookieStore = await cookies();
        cookieStore.set('craft_oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes — generous window for OAuth flow
            path: '/',
        });

        return {
            success: true,
            redirectUrl: authUrl,
            data: { communityId }
        };
    } catch (error: any) {
        console.error("Failed to generate Craft auth URL:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle OAuth callback from Craft.do
 * Exchange authorization code for access token and save connection
 */
export async function handleCraftCallback(
    communityId: string,
    code: string,
    state: string
): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        // Exchange code for token
        const token = await exchangeCraftCode(
            code,
            CRAFT_CLIENT_ID,
            CRAFT_CLIENT_SECRET,
            CRAFT_REDIRECT_URI
        );

        // Get user's Craft spaces to set default
        const spaces = await getCraftSpaces(token.accessToken);
        const primarySpace = spaces[0];

        if (!primarySpace) {
            return { success: false, error: "No Craft spaces available" };
        }

        // Check if integration already exists
        const existing = await db
            .select()
            .from(craftIntegrations)
            .where(eq(craftIntegrations.communityId, communityId));

        if (existing.length > 0) {
            // Update existing integration
            const [updated] = await db
                .update(craftIntegrations)
                .set({
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    tokenExpiresAt: new Date(token.expiresAt),
                    craftSpaceId: token.spaceId || primarySpace.id,
                    craftSpaceName: primarySpace.name,
                    isActive: true,
                })
                .where(eq(craftIntegrations.communityId, communityId))
                .returning();

            return {
                success: true,
                data: { integration: updated, message: "Craft workspace updated" }
            };
        } else {
            // Create new integration
            const [created] = await db
                .insert(craftIntegrations)
                .values({
                    communityId,
                    accessToken: token.accessToken,
                    refreshToken: token.refreshToken,
                    tokenExpiresAt: new Date(token.expiresAt),
                    craftSpaceId: token.spaceId || primarySpace.id,
                    craftSpaceName: primarySpace.name,
                    autoSyncDocuments: true,
                    syncedDocumentIds: {},
                })
                .returning();

            return {
                success: true,
                data: { integration: created, message: "Craft workspace connected" }
            };
        }
    } catch (error: any) {
        console.error("Failed to handle Craft callback:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get current Craft integration status
 */
export async function getCraftIntegrationStatus(
    communityId: string
): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        const [integration] = await db
            .select()
            .from(craftIntegrations)
            .where(eq(craftIntegrations.communityId, communityId));

        if (!integration) {
            return { success: true, data: { integration: null, connected: false } };
        }

        return {
            success: true,
            data: {
                integration: {
                    craftSpaceName: integration.craftSpaceName,
                    craftUserEmail: integration.craftUserEmail,
                    autoSyncDocuments: integration.autoSyncDocuments,
                    connectedAt: integration.connectedAt,
                    lastSyncAt: integration.lastSyncAt,
                    isActive: integration.isActive,
                },
                connected: true
            }
        };
    } catch (error: any) {
        console.error("Failed to get Craft integration status:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync a single document to Craft.do
 */
export async function syncDocumentToCraft(
    communityId: string,
    documentId: string
): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        // Get integration
        let [integration] = await db
            .select()
            .from(craftIntegrations)
            .where(eq(craftIntegrations.communityId, communityId));

        if (!integration || !integration.isActive) {
            return { success: false, error: "Craft.do integration not connected" };
        }

        // Refresh token if needed
        if (isTokenExpired({ accessToken: integration.accessToken, expiresAt: integration.tokenExpiresAt.getTime() } as CraftAuthToken)) {
            const newToken = await refreshCraftToken(
                integration.refreshToken!,
                CRAFT_CLIENT_ID,
                CRAFT_CLIENT_SECRET
            );

            [integration] = await db
                .update(craftIntegrations)
                .set({
                    accessToken: newToken.accessToken,
                    refreshToken: newToken.refreshToken,
                    tokenExpiresAt: new Date(newToken.expiresAt),
                })
                .where(eq(craftIntegrations.communityId, communityId))
                .returning();
        }

        // Get document to sync
        const [doc] = await db
            .select()
            .from(documents)
            .where(and(
                eq(documents.id, documentId),
                eq(documents.communityId, communityId)
            ));

        if (!doc) {
            return { success: false, error: "Document not found" };
        }

        // Get synced IDs map
        const syncedIds = (integration.syncedDocumentIds as any) || {};

        let craftDocId = syncedIds[documentId];
        const craftContent = `📄 ${doc.category || 'Document'}\n\n${doc.name}\n\n[View Original](${doc.url || '#'})`;

        if (craftDocId) {
            // Update existing Craft document
            await updateCraftDocument(
                integration.accessToken,
                integration.craftSpaceId,
                craftDocId,
                {
                    title: doc.name,
                    content: craftContent,
                }
            );
        } else {
            // Create new Craft document
            const craftDoc = await createCraftDocument(
                integration.accessToken,
                integration.craftSpaceId,
                {
                    title: doc.name,
                    content: craftContent,
                    folderId: integration.craftFolderId ?? undefined,
                }
            );

            craftDocId = craftDoc.id;

            // Update sync map
            syncedIds[documentId] = craftDocId;
            await db
                .update(craftIntegrations)
                .set({ syncedDocumentIds: syncedIds })
                .where(eq(craftIntegrations.communityId, communityId));
        }

        // Update last sync time
        await db
            .update(craftIntegrations)
            .set({ lastSyncAt: new Date() })
            .where(eq(craftIntegrations.communityId, communityId));

        return {
            success: true,
            data: { craftDocId, message: "Document synced to Craft.do" }
        };
    } catch (error: any) {
        console.error("Failed to sync document to Craft:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Sync all documents to Craft.do
 */
export async function syncAllDocumentsToCraft(
    communityId: string
): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        // Get all community documents
        const docs = await db
            .select()
            .from(documents)
            .where(eq(documents.communityId, communityId));

        let synced = 0;
        let failed = 0;

        for (const doc of docs) {
            const result = await syncDocumentToCraft(communityId, doc.id);
            if (result.success) {
                synced++;
            } else {
                failed++;
                console.error(`Failed to sync doc ${doc.id}:`, result.error);
            }
        }

        return {
            success: true,
            data: { synced, failed, message: `Synced ${synced} documents, ${failed} failed` }
        };
    } catch (error: any) {
        console.error("Failed to sync all documents:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Toggle auto-sync setting
 */
export async function toggleCraftAutoSync(
    communityId: string,
    enabled: boolean
): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        const [updated] = await db
            .update(craftIntegrations)
            .set({ autoSyncDocuments: enabled })
            .where(eq(craftIntegrations.communityId, communityId))
            .returning();

        return {
            success: true,
            data: { autoSyncDocuments: updated?.autoSyncDocuments }
        };
    } catch (error: any) {
        console.error("Failed to toggle Craft auto-sync:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Disconnect Craft integration
 */
export async function disconnectCraft(communityId: string): Promise<CraftIntegrationState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify admin access
        await requireAdminInCommunity(user.id, communityId);

        await db
            .update(craftIntegrations)
            .set({ isActive: false })
            .where(eq(craftIntegrations.communityId, communityId));

        return { success: true, data: { message: "Craft integration disconnected" } };
    } catch (error: any) {
        console.error("Failed to disconnect Craft:", error);
        return { success: false, error: error.message };
    }
}
