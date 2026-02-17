/**
 * Role Helper Utilities
 * 
 * Provides consistent role checking across the application,
 * supporting both the new multi-role system and legacy single role field.
 */

export interface UserWithRoles {
    role?: string;
    roles?: string[];
}

/**
 * Check if a user has a specific role (case-insensitive)
 */
export function hasRole(user: UserWithRoles | null | undefined, role: string): boolean {
    if (!user) return false;

    const normalizedRole = role.toLowerCase();

    // Check roles array first (new multi-role system)
    if (user.roles && user.roles.length > 0) {
        return user.roles.some(r => r.toLowerCase() === normalizedRole);
    }

    // Fallback to legacy role field
    return user.role?.toLowerCase() === normalizedRole;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: UserWithRoles | null | undefined, roles: string[]): boolean {
    if (!user) return false;
    return roles.some(role => hasRole(user, role));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(user: UserWithRoles | null | undefined, roles: string[]): boolean {
    if (!user) return false;
    return roles.every(role => hasRole(user, role));
}

/**
 * Get all roles for a user as an array
 */
export function getUserRoles(user: UserWithRoles | null | undefined): string[] {
    if (!user) return [];

    // Return roles array if it exists and has items
    if (user.roles && user.roles.length > 0) {
        return user.roles;
    }

    // Fallback to legacy role field
    if (user.role) {
        return [user.role];
    }

    // Default to Resident if no role is set
    return ['Resident'];
}

/**
 * Get the primary (first) role for a user
 */
export function getPrimaryRole(user: UserWithRoles | null | undefined): string {
    const roles = getUserRoles(user);
    return roles[0] || 'Resident';
}

/**
 * Check if user is an Admin
 */
export function isAdmin(user: UserWithRoles | null | undefined): boolean {
    return hasRole(user, 'admin');
}

/**
 * Check if user is a Board Member
 */
export function isBoardMember(user: UserWithRoles | null | undefined): boolean {
    return hasRole(user, 'board member');
}

/**
 * Check if user is an Event Manager
 */
export function isEventManager(user: UserWithRoles | null | undefined): boolean {
    return hasRole(user, 'event manager');
}

/**
 * Check if user can manage content (Admin, Board Member, or Event Manager)
 */
export function canManageContent(user: UserWithRoles | null | undefined): boolean {
    return hasAnyRole(user, ['admin', 'board member', 'event manager']);
}

/**
 * Check if user can upload documents (Admin or Board Member)
 */
export function canUploadDocuments(user: UserWithRoles | null | undefined): boolean {
    return hasAnyRole(user, ['admin', 'board member']);
}

/**
 * Check if user can manage users (Admin only)
 */
export function canManageUsers(user: UserWithRoles | null | undefined): boolean {
    return isAdmin(user);
}

/**
 * Check if user can create events (Admin, Board Member, or Event Manager)
 */
export function canCreateEvents(user: UserWithRoles | null | undefined): boolean {
    return hasAnyRole(user, ['admin', 'board member', 'event manager']);
}

/**
 * Format roles for display (e.g., "Admin, Board Member")
 */
export function formatRolesForDisplay(user: UserWithRoles | null | undefined): string {
    const roles = getUserRoles(user);
    return roles.join(', ');
}

/**
 * Get a display-friendly version of a single role
 */
export function formatRole(role: string): string {
    // Capitalize first letter of each word
    return role
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
