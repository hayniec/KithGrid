/**
 * Input validation helpers for security and data integrity
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    // RFC 5322 simplified regex for practical validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate UUID format (v4)
 */
export function validateUUID(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Validate community ID (any UUID)
 */
export function validateCommunityId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Validate user ID (any UUID)
 */
export function validateUserId(id: string): boolean {
    return validateCommunityId(id);
}

/**
 * Validate role value
 */
export function validateRole(role: string): boolean {
    if (!role || typeof role !== 'string') return false;
    const validRoles = ['Admin', 'Resident', 'Board Member', 'Event Manager'];
    return validRoles.includes(role);
}

/**
 * Validate invitation code format (alphanumeric, 6-8 characters)
 */
export function validateInvitationCode(code: string): boolean {
    if (!code || typeof code !== 'string') return false;
    return /^[A-Z0-9]{6,8}$/.test(code);
}

/**
 * Sanitize string input (trim and basic security)
 */
export function sanitizeInput(input: string): string {
    if (!input) return '';
    return String(input).trim().slice(0, 500); // Max 500 chars to prevent abuse
}

/**
 * Validate community slug format
 */
export function validateSlug(slug: string): boolean {
    if (!slug || typeof slug !== 'string') return false;
    return /^[a-z0-9-]{3,50}$/.test(slug.toLowerCase());
}

/**
 * Check if value is a valid password strength (at least 8 chars, mix of types)
 * Note: Passwords are never stored in DB - only used in Supabase Auth
 */
export function validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letters');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letters');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain numbers');
    }

    if (!/[!@#$%^&*]/.test(password)) {
        errors.push('Password must contain special characters (!@#$%^&*)');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
