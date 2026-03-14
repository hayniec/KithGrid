
/**
 * @deprecated This file is no longer used
 * 
 * Authentication is now handled exclusively by Supabase Auth via utils/auth.ts
 * Password authentication against the database has been removed for security reasons.
 * 
 * Migration guide:
 * - Use utils/auth.ts (signInWithPassword, signUp, etc.) for all auth operations
 * - Use utils/auth/permissions.ts for authorization checks
 * 
 * This file is kept only for reference. It can be safely deleted.
 */

// Note: All functions have been removed. See utils/auth.ts for current auth implementation.

export {};
