'use server'

import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";

// Hardcoded Super Admins for now - typically this would be in the DB or env
const SUPER_ADMINS = [
    "eric.haynie@gmail.com",
    process.env.SUPER_ADMIN_EMAIL
].filter((email): email is string => !!email).map(email => email.toLowerCase());

// Helper to check Super Admin capabilities
async function isSuperAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return false;
    return SUPER_ADMINS.includes(user.email.toLowerCase());
}

// Map DB row to UI Community type
// Supports both snake_case (Supabase client) and camelCase (Drizzle) column names
const mapToUI = (row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    plan: row.plan_tuple || row.planTuple || 'starter_100',
    features: {
        marketplace: row.has_marketplace ?? row.hasMarketplace,
        resources: row.has_resources ?? row.hasResources,
        events: row.has_events ?? row.hasEvents,
        documents: row.has_documents ?? row.hasDocuments,
        forum: row.has_forum ?? row.hasForum,
        messages: row.has_messages ?? row.hasMessages,
        services: row.has_service_pros ?? row.hasServicePros,
        local: row.has_local_guide ?? row.hasLocalGuide,
        emergency: row.has_emergency ?? row.hasEmergency,
    },
    isActive: row.is_active ?? row.isActive,
    branding: {
        logoUrl: row.logo_url || row.logoUrl || '',
        primaryColor: row.primary_color || row.primaryColor || '#4f46e5',
        secondaryColor: row.secondary_color || row.secondaryColor || '#1e1b4b',
        accentColor: row.accent_color || row.accentColor || '#f59e0b',
    },
    emergency: {
        accessCode: row.emergency_access_code || row.emergencyAccessCode || '',
        instructions: row.emergency_instructions || row.emergencyInstructions || ''
    }
});

export async function getTenants() {
    try {
        console.log("[SuperAdmin] getTenants called");

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email?.toLowerCase();
        const isAllowed = email && SUPER_ADMINS.includes(email);

        if (!isAllowed) {
            console.error(`[SuperAdmin] Authorization failed. User: ${email}`);
            return { success: false, error: `Unauthorized: User '${email || 'Unknown'}' does not have Super Admin access.` };
        }

        console.log("[SuperAdmin] Fetching all tenants via service role...");
        const adminClient = createServiceRoleClient();
        const { data: rows, error } = await adminClient
            .from('communities')
            .select('*');

        if (error) {
            console.error("[SuperAdmin] Query error:", error);
            return { success: false, error: "Failed to fetch tenants: " + error.message };
        }

        console.log(`[SuperAdmin] Found ${rows?.length ?? 0} tenants.`);
        return { success: true, data: (rows || []).map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch tenants (Critical Error):", error);
        if (error?.message) console.error("Error Message:", error.message);
        if (error?.stack) console.error("Error Stack:", error.stack);

        return { success: false, error: "Failed to fetch tenants: " + (error.message || "Unknown error") };
    }
}
