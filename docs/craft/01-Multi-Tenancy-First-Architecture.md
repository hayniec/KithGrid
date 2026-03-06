# Multi-Tenancy First Architecture

## Vision

KithGrid is a multi-tenant community management SaaS where **tenant selection is the gateway experience**. No user should ever land in a dashboard without first selecting or being routed to a specific community. Multi-tenancy is not a background concern — it is the first thing every user sees after authentication.

---

## Current State (What Exists)

### Schema — Ready
- `communities` table serves as the tenant entity with feature flags, branding, billing placeholders
- `members` table (DB name: `neighbors`) links users to communities with roles
- All 15+ data tables include `communityId` foreign keys
- Plan tiers defined: `starter_100`, `growth_250`, `pro_500`

### Server Actions — Ready
- `getCommunities()` fetches communities for the authenticated user via membership join
- `createCommunity()` creates a tenant and adds the creator as Admin
- `getCommunityById()` fetches a single tenant's config
- Feature toggles, branding, HOA settings all have CRUD actions

### What's Missing — The "Tenant-First" UX Flow
- Login currently redirects straight to `/dashboard` (no community selection)
- `UserContext` falls back to a hardcoded community ID: `2bf6bc8a-899c-4e29-8ee7-f2038c804260`
- No community picker or switcher exists in the UI
- No `/select-community` route exists
- Landing page "Get Started" links directly to `/dashboard`

---

## Target Architecture

### Authentication + Tenant Selection Flow

```
Landing Page (/)
    │
    ├── "Get Started" → /login
    │
    ▼
Login (/login)
    │  Supabase Auth (email/password or OAuth)
    │
    ▼
Community Gate (/select-community)   ← NEW
    │
    ├── User has 1 community → Auto-redirect to /dashboard
    ├── User has 2+ communities → Show picker
    ├── User has 0 communities → Show "Create" or "Join with Code"
    │
    ▼
Dashboard (/dashboard)
    │  communityId is now set in context + URL/cookie
    │
    └── Community Switcher in sidebar/header (for multi-community users)
```

### Key Principle: No Dashboard Without a Community

The `/dashboard` route and all sub-routes must validate that `communityId` is set. If not, redirect to `/select-community`.

---

## Implementation Plan

### Phase 1: Community Gate Page

**New Route: `/select-community/page.tsx`**

Responsibilities:
1. Fetch user's communities via `getCommunities()`
2. If exactly 1 community → set context + redirect to `/dashboard`
3. If 0 communities → show two options:
   - "Create a Community" (for HOA admins bootstrapping)
   - "Join with Invitation Code" (link to `/join`)
4. If 2+ communities → show card grid with community name, logo, role badge

**Data flow:**
- On selection, store `communityId` in:
  - `UserContext` state
  - `localStorage` (for persistence across refreshes)
  - Cookie `kithgrid_community` (for server-side middleware access)

### Phase 2: Update Login Redirect

**File: `/app/login/page.tsx`**

Change the success redirect:
```typescript
// BEFORE
router.push("/dashboard");

// AFTER
router.push("/select-community");
```

Also update the OAuth redirect:
```typescript
// BEFORE
redirectTo: `${window.location.origin}/dashboard`

// AFTER
redirectTo: `${window.location.origin}/select-community`
```

### Phase 3: Remove Hardcoded Community Fallback

**File: `/contexts/UserContext.tsx`**

Remove the hardcoded fallback:
```typescript
// REMOVE THIS LINE
communityId: meta.communityId || session.user.communityId || "2bf6bc8a-899c-4e29-8ee7-f2038c804260",

// REPLACE WITH
communityId: meta.communityId || session.user.communityId || undefined,
```

Remove the mock bypass user or gate it behind `NODE_ENV === 'development'`.

### Phase 4: Middleware Guard

**File: `/middleware.ts`**

Add logic to check for community selection:
```
- If path starts with /dashboard and no kithgrid_community cookie → redirect to /select-community
- If path is /select-community and user is not authenticated → redirect to /login
```

### Phase 5: Community Switcher Component

**New Component: `/components/dashboard/CommunitySwitcher.tsx`**

- Dropdown in the dashboard sidebar header
- Shows current community name + logo
- Lists other communities the user belongs to
- "Join Another Community" link
- "Create New Community" link (if user has admin role in any community)

### Phase 6: Update UserContext for Dynamic Community

**File: `/contexts/UserContext.tsx`**

Add:
```typescript
interface UserContextType {
    user: UserProfile;
    setUser: (user: UserProfile) => void;
    toggleRole: () => void;
    switchCommunity: (communityId: string) => Promise<void>;  // NEW
    communities: CommunityInfo[];  // NEW
}
```

`switchCommunity` should:
1. Update `communityId` in state
2. Re-fetch the user's member record for that community (roles may differ)
3. Update localStorage and cookie
4. Trigger a re-render of dashboard data

---

## Data Isolation Checklist

Every server action must enforce tenant boundaries. Current status:

| Action File | communityId Filter | Status |
|---|---|---|
| `neighbors.ts` | Yes | OK |
| `events.ts` | Yes | OK |
| `marketplace.ts` | Yes | OK |
| `forum.ts` | Yes | OK |
| `messages.ts` | Via member lookup | OK |
| `announcements.ts` | Yes | OK |
| `documents.ts` | Yes | OK |
| `resources.ts` | Yes | OK |
| `services.ts` | Yes | OK |
| `local.ts` | Yes | OK |
| `invitations.ts` | Yes | OK |
| `communities.ts` | Via membership join | OK |

**All actions already filter by communityId** — the schema is sound. The gap is purely in the frontend routing and context management.

---

## Database Changes Required

**None for core multi-tenancy.** The schema already supports everything needed.

Optional enhancements:
- Add `lastAccessedCommunityId` to `users` table (for remembering last-used community)
- Add `communities.subdomain` field (if supporting `oakhill.kithgrid.com` style URLs)

---

## URL Strategy Options

### Option A: Cookie-Based (Recommended for MVP)
- Community stored in cookie + context
- URLs stay as `/dashboard/forum`, `/dashboard/events`
- Simpler to implement, no routing changes needed

### Option B: Slug-Based URLs (Future)
- URLs become `/c/oak-hills/forum`, `/c/oak-hills/events`
- Requires Next.js dynamic route: `/c/[slug]/[...path]`
- Better for bookmarking and sharing
- Uses existing `communities.slug` field

### Option C: Subdomain-Based (Enterprise)
- `oakhill.kithgrid.com/dashboard`
- Requires DNS wildcard and middleware subdomain parsing
- Best for white-label scenarios

**Recommendation:** Start with Option A, migrate to Option B when ready. The `slug` field already exists in the schema.
