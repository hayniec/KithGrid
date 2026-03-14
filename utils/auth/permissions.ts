/**
 * Centralized authorization helpers
 * 
 * All permission checks should go through these functions to ensure
 * consistent security enforcement across the application.
 */

import { db } from "@/db";
import { members } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface AuthorizedMember {
    id: string;
    userId: string;
    communityId: string;
    role: string;
    roles?: string[];
}

/**
 * Check if user is an admin in a specific community
 * Supports both new (roles array) and legacy (role string) schemas
 */
export async function isUserAdminInCommunity(
    userId: string,
    communityId: string
): Promise<boolean> {
    if (!userId || !communityId) return false;

    try {
        const [member] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

        if (!member) return false;

        // Check new roles array first
        if (member.roles && Array.isArray(member.roles)) {
            return member.roles.some((r: string | null | undefined) => r?.toLowerCase() === "admin");
        }

        // Fallback to legacy role field
        return member.role?.toLowerCase() === "admin";
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
}

/**
 * Require user to be admin in community, throw if not
 * Use this in server actions that require admin access
 */
export async function requireAdminInCommunity(
    userId: string,
    communityId: string
): Promise<AuthorizedMember> {
    if (!userId || !communityId) {
        throw new Error("Unauthorized: Missing user or community context");
    }

    const [member] = await db
        .select()
        .from(members)
        .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

    if (!member) {
        throw new Error("Unauthorized: User is not a member of this community");
    }

    const isAdmin =
        (member.roles && Array.isArray(member.roles) && member.roles.some((r: string | null | undefined) => r?.toLowerCase() === "admin")) ||
        member.role?.toLowerCase() === "admin";

    if (!isAdmin) {
        throw new Error("Unauthorized: Admin access required for this action");
    }

    return member as AuthorizedMember;
}

/**
 * Check if user has any of the specified roles in a community
 */
export async function userHasAnyRoleInCommunity(
    userId: string,
    communityId: string,
    requiredRoles: string[]
): Promise<boolean> {
    if (!userId || !communityId || !requiredRoles.length) return false;

    try {
        const [member] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

        if (!member) return false;

        const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());

        // Check new roles array first
        if (member.roles && Array.isArray(member.roles)) {
            return member.roles.some((r: string | null | undefined) => {
                const normalized = r?.toLowerCase();
                return normalized && normalizedRequired.includes(normalized);
            });
        }

        // Fallback to legacy role field
        return normalizedRequired.includes(member.role?.toLowerCase() || "");
    } catch (error) {
        console.error("Error checking user roles:", error);
        return false;
    }
}

/**
 * Require user to have at least one of the specified roles, throw if not
 */
export async function requireRoleInCommunity(
    userId: string,
    communityId: string,
    requiredRoles: string[]
): Promise<AuthorizedMember> {
    if (!userId || !communityId || !requiredRoles.length) {
        throw new Error("Unauthorized: Missing required context");
    }

    const [member] = await db
        .select()
        .from(members)
        .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

    if (!member) {
        throw new Error("Unauthorized: User is not a member of this community");
    }

    const normalizedRequired = requiredRoles.map((r) => r.toLowerCase());
    const hasRole =
        (member.roles &&
            Array.isArray(member.roles) &&
            member.roles.some((r: string | null | undefined) => {
                const normalized = r?.toLowerCase();
                return normalized && normalizedRequired.includes(normalized);
            })) ||
        normalizedRequired.includes(member.role?.toLowerCase() || "");

    if (!hasRole) {
        throw new Error(
            `Unauthorized: User must have one of these roles: ${requiredRoles.join(", ")}`
        );
    }

    return member as AuthorizedMember;
}

/**
 * Verify user membership in a community
 */
export async function verifyMembershipInCommunity(
    userId: string,
    communityId: string
): Promise<AuthorizedMember> {
    if (!userId || !communityId) {
        throw new Error("Unauthorized: Missing user or community context");
    }

    const [member] = await db
        .select()
        .from(members)
        .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

    if (!member) {
        throw new Error("Unauthorized: User is not a member of this community");
    }

    return member as AuthorizedMember;
}

/**
 * Get user's role in a community (returns primary role or 'Resident')
 */
export async function getUserRoleInCommunity(userId: string, communityId: string): Promise<string> {
    if (!userId || !communityId) return "Resident";

    try {
        const [member] = await db
            .select()
            .from(members)
            .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

        if (!member) return "Resident";

        // Return primary role from new roles array, or legacy role
        if (member.roles && Array.isArray(member.roles) && member.roles.length > 0) {
            return member.roles[0];
        }

        return member.role || "Resident";
    } catch (error) {
        console.error("Error fetching user role:", error);
        return "Resident";
    }
}
