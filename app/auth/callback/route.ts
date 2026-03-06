import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Auth callback route.
 * Supabase redirects here after email confirmation, password reset, and OAuth flows.
 * Exchanges the code for a session, then redirects to the appropriate page.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/select-community";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // If code exchange failed or no code, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
}
