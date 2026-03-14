import { NextRequest, NextResponse } from 'next/server';
import { handleCraftCallback } from '@/app/actions/craft';

/**
 * OAuth 2.0 Callback handler for Craft.do
 * 
 * This endpoint is called by Craft.do after user authorizes KithGrid
 * URL: /auth/craft/callback?code=AUTH_CODE&state=STATE&communityId=COMMUNITY_ID
 */
export async function GET(request: NextRequest) {
    try {
        const code = request.nextUrl.searchParams.get('code');
        const state = request.nextUrl.searchParams.get('state');
        const communityId = request.nextUrl.searchParams.get('communityId');

        // Validate required parameters
        if (!code) {
            return NextResponse.json(
                { error: 'Missing authorization code' },
                { status: 400 }
            );
        }

        if (!communityId) {
            return NextResponse.json(
                { error: 'Missing community ID' },
                { status: 400 }
            );
        }

        // Validate state (CSRF protection)
        // In production, verify against stored state in session/cache
        if (!state) {
            console.warn('Warning: No state parameter in Craft OAuth callback');
        }

        // Exchange code for token and save integration
        const result = await handleCraftCallback(communityId, code, state || '');

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        // Redirect to admin panel with success indicator
        const redirectUrl = new URL('/dashboard/admin', request.nextUrl.origin);
        redirectUrl.searchParams.set('craft', 'connected');
        redirectUrl.searchParams.set('tab', 'integrations');

        return NextResponse.redirect(redirectUrl.toString());
    } catch (error: any) {
        console.error('[Craft OAuth] Callback error:', error);

        // Redirect back to admin with error
        const errorUrl = new URL('/dashboard/admin', request.nextUrl.origin);
        errorUrl.searchParams.set('craft', 'error');
        errorUrl.searchParams.set('message', error.message || 'Failed to connect Craft.do');

        return NextResponse.redirect(errorUrl.toString());
    }
}
