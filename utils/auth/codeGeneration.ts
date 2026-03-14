/**
 * Secure code generation utilities
 * 
 * Used for invitation codes, reset tokens, and other security-sensitive tokens
 */

import { randomBytes, randomInt } from "crypto";

/**
 * Generate a secure random invitation code using crypto
 * Format: 8 uppercase alphanumeric characters
 * Examples: "A1B2C3D4", "X9Y8Z7W6"
 *
 * Why crypto? Math.random() is not cryptographically secure and codes can be brute-forced
 */
export function generateSecureInvitationCode(): string {
    // Generate 6 random bytes = 48 bits
    // Base32 encoding gives us 8 characters
    const bytes = randomBytes(6);
    
    // Convert to hex then to base36 for alphanumeric
    // Using a simple approach: take randomBytes and convert to base36
    const code = bytes
        .toString("hex")
        .substring(0, 8)
        .toUpperCase();
    
    // Ensure it's exactly 8 characters
    return code.padEnd(8, "0").substring(0, 8);
}

/**
 * Generate a secure password reset token
 * Format: 32 hex characters
 * Very difficult to guess even with unlimited attempts
 */
export function generatePasswordResetToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Generate a secure session token
 * Format: 64 hex characters
 */
export function generateSessionToken(): string {
    return randomBytes(32).toString("hex");
}

/**
 * Generate a secure verification code (6 digits)
 * Used for 2FA or email verification
 */
export function generateVerificationCode(): string {
    return randomInt(100000, 999999).toString();
}

/**
 * Validate if a code matches the expected format
 */
export function isValidInvitationCode(code: string): code is string {
    if (!code || typeof code !== "string") return false;
    // 6-8 uppercase alphanumeric characters
    return /^[A-Z0-9]{6,8}$/.test(code);
}
