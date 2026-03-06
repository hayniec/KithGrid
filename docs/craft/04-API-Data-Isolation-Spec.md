# API & Data Isolation Specification

## Principle

Every database query in KithGrid must be scoped to a community. No action should ever return data from a community the user does not belong to. This document defines the rules and patterns for enforcing tenant isolation.

---

## Current Architecture

### How communityId Flows Through the System

```
Client (Browser)
    │
    ├── UserContext holds communityId in React state
    ├── localStorage persists communityId across refreshes
    │
    ▼
Server Action (called from client)
    │
    ├── Receives communityId as parameter from client
    │   OR
    ├── Derives communityId from authenticated user's session
    │
    ▼
Drizzle ORM Query
    │
    └── .where(eq(table.communityId, communityId))
```

### Trust Boundary

**Current approach:** Most server actions receive `communityId` as a parameter from the client. This is acceptable as long as:
1. The server action validates that the authenticated user is a member of that community
2. The membership check happens before any data query

**Recommended enhancement:** Add a reusable helper function:

```typescript
// utils/tenantGuard.ts
export async function validateTenantAccess(
    userId: string,
    communityId: string
): Promise<{ valid: boolean; member?: MemberRecord }> {
    const [membership] = await db
        .select()
        .from(members)
        .where(
            and(
                eq(members.userId, userId),
                eq(members.communityId, communityId)
            )
        );

    return membership
        ? { valid: true, member: membership }
        : { valid: false };
}
```

This should be called at the top of every server action that accepts a `communityId` parameter.

---

## Server Actions: Isolation Audit

### Actions That Accept communityId from Client

These actions trust the client-provided communityId. Each should add a `validateTenantAccess` check:

| Action | Function | communityId Source | Needs Guard |
|--------|----------|--------------------|-------------|
| `neighbors.ts` | `getNeighbors(communityId)` | Parameter | Yes |
| `neighbors.ts` | `addNeighbor(data)` | In data object | Yes |
| `events.ts` | `getEvents(communityId)` | Parameter | Yes |
| `events.ts` | `createEvent(data)` | In data object | Yes |
| `marketplace.ts` | `getMarketplaceItems(communityId)` | Parameter | Yes |
| `marketplace.ts` | `createMarketplaceItem(data)` | In data object | Yes |
| `forum.ts` | `getForumPosts(communityId)` | Parameter | Yes |
| `forum.ts` | `createForumPost(data)` | In data object | Yes |
| `announcements.ts` | `getAnnouncements(communityId)` | Parameter | Yes |
| `documents.ts` | `getDocuments(communityId)` | Parameter | Yes |
| `resources.ts` | `getResources(communityId)` | Parameter | Yes |
| `services.ts` | `getServiceProviders(communityId)` | Parameter | Yes |
| `local.ts` | `getLocalPlaces(communityId)` | Parameter | Yes |
| `invitations.ts` | `createInvitation(data)` | In data object | Yes |

### Actions That Derive communityId from Session

These are more secure because the server determines the community:

| Action | Function | Notes |
|--------|----------|-------|
| `communities.ts` | `getCommunities()` | Queries via membership join — secure |
| `communities.ts` | `createCommunity(data)` | Creates new tenant — no isolation concern |
| `user.ts` | `getUserProfile(userId)` | Returns user's first community — needs multi-community awareness |

---

## Data Model: Cross-Tenant References

### Tables with communityId (Properly Isolated)
- `members` (neighbors)
- `events`
- `eventRsvps` (via event's communityId)
- `marketplaceItems`
- `resources`
- `reservations`
- `forumPosts`
- `forumComments` (via post's communityId)
- `forumLikes` (via post's communityId)
- `documents`
- `announcements`
- `serviceProviders`
- `localPlaces`

### Tables Without communityId
- `users` — Global authentication table. This is correct; users exist across tenants.
- `directMessages` — Scoped by sender/recipient member IDs. Since member IDs are community-specific, messages are implicitly tenant-scoped.

### Potential Leak Points

1. **Direct Messages:** If a user has memberships in Community A and B, their member IDs differ per community. Messages sent via their Community A member ID should not appear when viewing Community B. The current query filters by member ID, which handles this correctly.

2. **Forum Comments/Likes:** These reference `postId` and `memberId`. Since posts have `communityId`, comments are implicitly scoped. No leak risk.

3. **Event RSVPs:** Reference `eventId` which has `communityId`. Implicitly scoped. No leak risk.

---

## Recommended Security Enhancements

### 1. Tenant Guard Middleware Pattern

```typescript
// In each server action:
export async function getEvents(communityId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) return { success: false, error: "Unauthorized" };

    // Validate tenant access
    const access = await validateTenantAccess(user.email, communityId);
    if (!access.valid) return { success: false, error: "Access denied" };

    // Proceed with query
    const results = await db.select()
        .from(events)
        .where(eq(events.communityId, communityId));

    return { success: true, data: results };
}
```

### 2. Row-Level Security (RLS) in PostgreSQL

If using Supabase's PostgreSQL directly, consider adding RLS policies as a defense-in-depth layer:

```sql
-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see events in their communities
CREATE POLICY "tenant_isolation" ON events
    FOR ALL
    USING (
        community_id IN (
            SELECT community_id FROM neighbors
            WHERE user_id = auth.uid()
        )
    );
```

This provides database-level isolation even if application code has bugs.

### 3. Audit Logging

For compliance and debugging, log cross-tenant access attempts:

```typescript
// utils/auditLog.ts
export async function logTenantAccess(
    userId: string,
    communityId: string,
    action: string,
    allowed: boolean
) {
    // Log to console in development, to a logging service in production
    console.log(`[TENANT] user=${userId} community=${communityId} action=${action} allowed=${allowed}`);
}
```

---

## Super Admin Considerations

The super admin panel (`/super-admin`) intentionally crosses tenant boundaries — it lists all communities and their stats. This is correct behavior for platform operators.

**Guard:** The super admin route must validate that the user has a platform-level admin flag. Currently this is not enforced at the server level. Add:

```typescript
// In super-admin actions
const SUPER_ADMIN_EMAILS = process.env.SUPER_ADMIN_EMAILS?.split(',') || [];

function isSuperAdmin(email: string): boolean {
    return SUPER_ADMIN_EMAILS.includes(email);
}
```

---

## Testing Data Isolation

### Manual Test Cases

1. **Cross-tenant read:** Log in as User A (Community 1). Manually change communityId in localStorage to Community 2's ID. Verify that server actions reject the request.

2. **Cross-tenant write:** Attempt to create a forum post with a different community's ID. Verify rejection.

3. **Multi-community user:** User belongs to both Community 1 and 2. Switch communities. Verify only the selected community's data appears.

4. **Direct messages:** User in Community A messages User X. Switch to Community B. Verify the conversation does not appear (different member IDs).

### Automated Test Skeleton

```typescript
describe('Tenant Isolation', () => {
    it('should reject getEvents for non-member community', async () => {
        const result = await getEvents('community-user-does-not-belong-to');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Access denied');
    });

    it('should return only current community data', async () => {
        const result = await getForumPosts(userCommunityId);
        result.data.forEach(post => {
            expect(post.communityId).toBe(userCommunityId);
        });
    });
});
```
