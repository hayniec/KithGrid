/**
 * Auth abstraction layer.
 * All provider-specific calls (Supabase, Firebase, etc.) go here.
 * The rest of the app imports from this file — swap the implementation
 * when migrating providers.
 */
import { createClient } from "@/utils/supabase/client";

function getClient() {
    return createClient();
}

export async function signInWithPassword(email: string, password: string) {
    const supabase = getClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const, user: data.user };
}

export async function signInWithOAuth(provider: "google" | "facebook" | "apple", redirectTo: string) {
    const supabase = getClient();
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
}

export async function signUp(email: string, password: string, metadata?: Record<string, string>) {
    const supabase = getClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
    });
    if (error) return { success: false as const, error: error.message };

    // Supabase returns a user with identities=[] when email already exists
    // but confirmation is required — treat as success so we show "check email"
    const needsEmailConfirmation = data.user && !data.session;
    return {
        success: true as const,
        user: data.user,
        needsEmailConfirmation,
    };
}

export async function sendPasswordResetEmail(email: string, redirectTo: string) {
    const supabase = getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
}

export async function updatePassword(newPassword: string) {
    const supabase = getClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false as const, error: error.message };
    return { success: true as const };
}

export async function signOut() {
    const supabase = getClient();
    await supabase.auth.signOut();
}
