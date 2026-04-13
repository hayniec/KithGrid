import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    // First, refresh the Supabase session (handles token refresh + cookie updates)
    const response = await updateSession(request)

    const { pathname } = request.nextUrl

    // Check if user has an active Supabase session by looking for auth cookies
    const hasAuthSession = request.cookies.getAll().some(
        cookie => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    // Check if a community is selected
    const hasCommunity = request.cookies.has('kithgrid_community')

    // Guard: /super-admin requires authentication
    if (pathname.startsWith('/super-admin') && !hasAuthSession) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', '/super-admin')
        return NextResponse.redirect(url)
    }

    // Guard: /select-community, /create-community, /join-community require authentication
    const authRequiredPaths = ['/select-community', '/create-community', '/join-community']
    if (authRequiredPaths.some(p => pathname.startsWith(p)) && !hasAuthSession) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Guard: /dashboard requires both auth AND a selected community
    if (pathname.startsWith('/dashboard')) {
        if (!hasAuthSession) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        if (!hasCommunity) {
            const url = request.nextUrl.clone()
            url.pathname = '/select-community'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
