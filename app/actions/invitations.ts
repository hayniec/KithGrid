'use server'

import { db } from "@/db";
import { invitations, members, communities } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendInvitationEmail } from "@/app/lib/email";
import { createClient } from "@/utils/supabase/server";
import { requireAdminInCommunity } from "@/utils/auth/permissions";
import { generateSecureInvitationCode } from "@/utils/auth/codeGeneration";
import { validateEmail, validateCommunityId } from "@/utils/validation";

export type InvitationActionState = {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
};

// ...

/**
 * Create a new invitation (Admin only)
 */
export async function createInvitation(data: {
    communityId: string;
    email: string;
    role?: 'Admin' | 'Resident' | 'Board Member';
    createdBy?: string; // Legacy parameter, ignored in favor of session
}): Promise<InvitationActionState> {
    try {
        // Validate inputs
        if (!validateEmail(data.email)) {
            return { success: false, error: "Invalid email format" };
        }

        if (!validateCommunityId(data.communityId)) {
            return { success: false, error: "Invalid community ID" };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Use centralized permission check - throws if not admin
        const adminMember = await requireAdminInCommunity(user.id, data.communityId);

        // Enforce max homes limit before creating invitation
        const { checkMemberLimit } = await import("@/app/actions/billing");
        const limitCheck = await checkMemberLimit(data.communityId);
        if (!limitCheck.allowed) {
            return {
                success: false,
                error: `Community has reached its member limit (${limitCheck.currentCount}/${limitCheck.maxHomes}). Upgrade the plan to invite more members.`
            };
        }

        const code = generateSecureInvitationCode();

        const [invitation] = await db.insert(invitations).values({
            communityId: data.communityId,
            email: data.email,
            code,
            role: data.role || 'Resident',
            createdBy: adminMember.id,
            status: 'pending',
        }).returning();

        // Fetch Community Name for the email
        const [community] = await db.select({ name: communities.name }).from(communities).where(eq(communities.id, data.communityId));

        // Attempt to send email (don't block return on failure, just log)
        if (community) {
            await sendInvitationEmail(data.email, code, community.name);
        }

        return {
            success: true,
            data: {
                id: invitation.id,
                code: invitation.code,
                email: invitation.email,
                status: invitation.status,
            },
            message: `Invitation created and email sent! Code: ${code}`
        };
    } catch (error: any) {
        console.error("Failed to create invitation:", error);
        
        // Check if it's an authorization error
        if (error.message?.includes("Unauthorized")) {
            return { success: false, error: error.message };
        }

        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to create invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Bulk create invitations (for CSV Import)
 */
export async function bulkCreateInvitations(data: {
    communityId: string;
    invitations: { email: string; name?: string }[];
    createdBy: string;
}): Promise<InvitationActionState> {
    try {
        // Validate inputs
        if (!validateCommunityId(data.communityId)) {
            return { success: false, error: "Invalid community ID" };
        }

        if (!Array.isArray(data.invitations) || data.invitations.length === 0) {
            return { success: false, error: "No invitations provided" };
        }

        // Validate all emails first
        const invalidEmails = data.invitations.filter(inv => !validateEmail(inv.email));
        if (invalidEmails.length > 0) {
            return { 
                success: false, 
                error: `Invalid email format for: ${invalidEmails.map(e => e.email).join(", ")}` 
            };
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || data.createdBy;

        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Use centralized permission check - throws if not admin
        const adminMember = await requireAdminInCommunity(userId, data.communityId);

        const values = data.invitations.map(inv => ({
            communityId: data.communityId,
            email: inv.email,
            invitedName: inv.name || null,
            code: generateSecureInvitationCode(), // Generate unique secure code for each
            createdBy: adminMember.id,
            status: 'pending' as const
        }));

        const inserted = await db.insert(invitations).values(values).returning();

        return {
            success: true,
            data: inserted,
            message: `Successfully created ${inserted.length} invitations.`
        };

    } catch (error: any) {
        console.error("Failed to bulk create invitations:", error);
        
        if (error.message?.includes("Unauthorized")) {
            return { success: false, error: error.message };
        }

        return { success: false, error: error.message || "Failed to bulk create invitations" };
    }
}

/**
 * Get all invitations for a community
 */

export async function getInvitations(communityId: string): Promise<InvitationActionState> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify requestor has admin/board access
        const [membership] = await db
            .select()
            .from(members)
            .where(
                and(
                    eq(members.userId, user.id),
                    eq(members.communityId, communityId)
                )
            );

        if (!membership || !['Admin', 'Board Member'].includes(membership.role || '')) {
            return { success: false, error: "Insufficient permissions" };
        }

        const results = await db
            .select()
            .from(invitations)
            .where(eq(invitations.communityId, communityId));

        return {
            success: true,
            data: results.map(inv => ({
                id: inv.id,
                code: inv.code,
                email: inv.email,
                status: inv.status,
                createdAt: inv.createdAt,
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch invitations:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to fetch invitations";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Validate an invitation code
 */
export async function validateInvitation(code: string): Promise<InvitationActionState> {
    try {
        const [invitation] = await db
            .select()
            .from(invitations)
            .where(
                and(
                    eq(invitations.code, code.toUpperCase()),
                    eq(invitations.status, 'pending')
                )
            );

        if (!invitation) {
            return {
                success: false,
                error: "Invalid or expired invitation code"
            };
        }

        // Check if expired (if expiresAt is set)
        if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
            return {
                success: false,
                error: "This invitation code has expired"
            };
        }

        // Fetch community name for display
        let communityName = "Community";
        try {
            const [comm] = await db
                .select({ name: communities.name })
                .from(communities)
                .where(eq(communities.id, invitation.communityId));
            if (comm) communityName = comm.name;
        } catch (e) {
            // Non-critical, proceed with default name
        }

        return {
            success: true,
            data: {
                id: invitation.id,
                code: invitation.code,
                email: invitation.email,
                communityId: invitation.communityId,
                communityName,
                role: invitation.role,
            }
        };
    } catch (error: any) {
        console.error("Failed to validate invitation:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to validate invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Mark an invitation as used
 */
export async function markInvitationUsed(code: string): Promise<InvitationActionState> {
    try {
        const [updated] = await db
            .update(invitations)
            .set({ status: 'used' })
            .where(eq(invitations.code, code.toUpperCase()))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: "Invitation not found"
            };
        }

        return {
            success: true,
            message: "Invitation marked as used"
        };
    } catch (error: any) {
        console.error("Failed to mark invitation as used:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to update invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Delete an invitation (Admin only implicitly, but should probably verify ownership or admin)
 */
export async function deleteInvitation(id: string): Promise<InvitationActionState> {
    try {
        await db.delete(invitations).where(eq(invitations.id, id));

        return {
            success: true,
            message: "Invitation deleted"
        };
    } catch (error: any) {
        console.error("Failed to delete invitation:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to delete invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}
