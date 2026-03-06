# Tenant Onboarding Flow

## Overview

There are two distinct onboarding paths in KithGrid:

1. **Community Creator** — An HOA admin who bootstraps a new tenant
2. **Community Joiner** — A resident who joins an existing community via invitation

Both paths must result in a user with an active `members` record tied to a `communities` record.

---

## Path 1: Community Creator (New Tenant Bootstrap)

### Trigger
User lands on `/select-community` with zero community memberships and clicks "Create a Community."

### Flow

```
/select-community
    │ "Create a Community"
    ▼
/create-community (NEW page)
    │
    ├── Step 1: Community Info
    │   - Community Name (required)
    │   - Slug / URL handle (auto-generated, editable)
    │   - Type: HOA, Condo, Neighborhood, Co-op
    │
    ├── Step 2: Plan Selection
    │   - Starter (up to 100 homes) — Free tier / trial
    │   - Growth (up to 250 homes)
    │   - Pro (up to 500 homes)
    │
    ├── Step 3: Feature Selection
    │   - Toggle modules on/off:
    │     Forum, Events, Marketplace, Resources,
    │     Documents, Messages, Services, Local Guide, Emergency
    │   - All on by default
    │
    ├── Step 4: Branding (Optional)
    │   - Logo upload
    │   - Primary / Secondary / Accent colors
    │   - Preview card showing how it will look
    │
    └── Step 5: Confirmation
        - Summary of selections
        - "Create Community" button
        - Calls createCommunity() server action
        - Creator becomes Admin member automatically
        - Redirect to /dashboard
```

### Server Action: `createCommunity()`

Already implemented in `/app/actions/communities.ts`. It:
1. Inserts into `communities` table
2. Creates a `members` record with `role: 'Admin'` for the creator
3. Returns the new community data

### What Needs Building
- `/app/create-community/page.tsx` — Multi-step form
- Form validation (unique slug, required fields)
- Plan selection UI (cards with feature comparison)
- Logo upload integration (Supabase Storage or similar)

---

## Path 2: Community Joiner (Invitation-Based)

### Trigger
Resident receives an invitation code from their community admin.

### Current Flow (Already Built)

```
/join
    │
    ├── Enter invitation code
    ├── Enter name, email, password, address
    ├── Server validates code against `invitations` table
    ├── Creates `users` record (via Supabase Auth)
    ├── Creates `members` record with role from invitation
    ├── Marks invitation as 'used'
    │
    └── Redirect to /login → /select-community → /dashboard
```

### What Exists
- `/app/join/page.tsx` — Full signup form with code validation
- `/app/actions/invitations.ts` — Code validation, bulk import
- `/app/actions/neighbors.ts` — Member creation

### What Needs Updating
- After join, redirect to `/select-community` instead of `/dashboard`
- If user already exists (email match), add them to the new community without creating a duplicate user
- Show confirmation: "You've been added to [Community Name] as a [Role]"

---

## Path 3: Existing User Joins Additional Community

### Trigger
User is already authenticated and a member of Community A. They receive an invitation code for Community B.

### Flow

```
Dashboard (/dashboard)
    │ Community Switcher → "Join Another Community"
    ▼
/join-community (NEW page, simpler than /join)
    │
    ├── Enter invitation code
    ├── No need for name/email/password (already authenticated)
    ├── Validate code
    ├── Create new members record for Community B
    ├── Show: "Welcome to [Community B]! Switch now?"
    │
    └── Yes → switchCommunity(communityB.id) → /dashboard
```

### What Needs Building
- `/app/join-community/page.tsx` — Simplified join form (code only)
- Server action: `joinCommunityWithCode(code: string)` — validates code, creates member record for current user

---

## Admin: Inviting Members

### Current System (Already Built)

Admins can invite members from `/dashboard/admin`:

1. **Single Invite** — Enter email, name, role, optional HOA position
2. **Bulk CSV Import** — Upload CSV with columns: email, name, role, address

Each invitation generates a unique 6-character code stored in the `invitations` table.

### What Needs Updating
- Add email sending via Resend API (integration is configured but not wired)
- Invitation email template with:
  - Community name and branding
  - Personalized greeting
  - Invitation code prominently displayed
  - "Join Now" button linking to `/join?code=ABC123`
  - Expiration date

### Email Template Structure
```
Subject: You're invited to join [Community Name] on KithGrid

Hi [Name],

[Admin Name] has invited you to join [Community Name] on KithGrid.

Your invitation code: [CODE]

Join now: https://kithgrid.com/join?code=[CODE]

This invitation expires on [Date].
```

---

## Onboarding Checklist for New Communities

After a community is created, the admin should see a setup checklist on their first dashboard visit:

- [ ] Upload community logo
- [ ] Set community colors
- [ ] Configure HOA dues (amount, frequency, due date)
- [ ] Add board members
- [ ] Invite first batch of residents
- [ ] Create a welcome announcement
- [ ] Add community resources (clubhouse, pool, etc.)
- [ ] Upload HOA governing documents
- [ ] Set emergency contact information

This could be a dismissable banner component on the dashboard that tracks completion.

---

## Database Records Created During Onboarding

### Community Creator
1. `communities` row — new tenant
2. `users` row — if not already existing (via Supabase Auth)
3. `members` row — Admin role, linked to user + community

### Community Joiner
1. `users` row — new user (via Supabase Auth signup)
2. `members` row — role from invitation, linked to user + community
3. `invitations` row updated — status changed to 'used'

### Existing User Adding Community
1. `members` row — new membership for existing user
2. `invitations` row updated — status changed to 'used'
