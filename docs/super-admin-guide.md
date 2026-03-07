# KithGrid Super Administrator Guide

This guide is for **super administrators** — platform operators who manage all communities (tenants) across the entire KithGrid platform. Super admins do not operate within a single community; they oversee the multi-tenant system.

---

## Access

**Path:** `/super-admin`

Super admin access is granted by email allowlist. Authorized emails are configured in `app/actions/super-admin.ts` and via the `SUPER_ADMIN_EMAIL` environment variable. Only users whose Supabase auth email matches the allowlist can access the console.

---

## Console Overview

The Super Admin Console has two view modes, toggled by buttons at the top:

1. **Tenants** — Create, configure, and manage individual communities
2. **Usage Tracking** — Platform-wide analytics and per-community usage stats

A **Sign Out** button and **Add Tenant** button are always visible in the header.

---

## Tenants View

### Tenant Cards

Each community appears as a card showing:

- **Community name** and ID (truncated UUID)
- **Slug** (URL handle, e.g., `oak-hills`)
- **Active/Disabled** status toggle
- **Current plan** (Starter 100, Growth 250, Pro 500)

### Creating a New Tenant

1. Click **Add Tenant**
2. Enter:
   - **Community Name** (e.g., "Maple Grove HOA")
   - **Slug** (e.g., `maple-grove`) — used as the URL identifier
3. Click **Create Tenant**

The community is created with:
- Default plan: Starter (100 homes)
- All feature modules enabled
- Default branding colors (Indigo theme)
- A **14-day free trial** starting immediately

### Inviting the First Administrator

Every new community needs an initial admin. To set one up:

1. Click the **Invite** icon (person with plus) on the tenant card
2. Enter the administrator's **email address**
3. Click **Generate Invitation**
4. A **6-character invitation code** is generated
5. Share the code securely with the admin — they use it at `/join` to create their account with Admin privileges

### Module Configuration

Each tenant has individually toggleable feature modules:

| Module | Controls |
|--------|----------|
| Marketplace | Buy/sell/trade listings |
| Resources | Shared facility and equipment reservations |
| Events | Community event calendar and RSVPs |
| Documents | HOA document storage |
| Forum | Community discussion board |
| Messages | Direct messaging between members |
| Services | Service provider directory |
| Local Guide | Local business and restaurant directory |
| Emergency | SOS button and emergency contact system |

Toggle any module **on or off** per community. Disabled modules are hidden from that community's sidebar and dashboard.

### Branding

Set per-community branding directly from the tenant card:

- **Primary Color** — Main UI accent
- **Secondary Color** — Sidebar and secondary elements
- **Logo URL** — Community logo image

### Tenant Status

- **Active** (green) — Community is fully operational
- **Disabled** (grey) — Community is suspended; members cannot access the dashboard

Click the status badge to toggle between active and disabled.

### Simulate Login

Click **Simulate Login** on any tenant card to:
- Set your session to that community's context
- Apply their branding colors and logo
- Redirect to `/dashboard` as if you were a member

This is useful for testing and troubleshooting community-specific issues.

### Exporting Tenant Data

Click the **Download** icon to export a tenant's full configuration as a JSON file. The export includes:
- Community settings and branding
- Feature flags
- Plan information
- Emergency configuration

### Deleting a Tenant

Click **Delete** and confirm. This permanently removes the community and all associated data. This action cannot be undone.

---

## Usage Tracking View

Click **Usage Tracking** to switch to the analytics dashboard. Data is fetched fresh each time you switch to this view.

### Platform Totals

Six summary cards across the top:

| Metric | What it counts |
|--------|----------------|
| Communities | Total tenant count |
| Total Members | Sum of all members across all communities |
| Forum Posts | Total forum posts platform-wide |
| Events | Total events created |
| Listings | Total marketplace items |
| Messages | Total direct messages sent |

### Per-Community Usage Table

A detailed table with one row per community:

| Column | Description |
|--------|-------------|
| Community | Name and slug |
| Plan | Current plan tier |
| Status | `active`, `trial`, or `expired` |
| Members | Current member count / plan max |
| Usage | Visual progress bar with percentage |
| Posts | Forum post count |
| Events | Event count |
| Listings | Marketplace listing count |
| Messages | Direct message count |
| Invites | Total invitations generated |
| Trial Ends | Trial expiration date (if applicable) |

### Usage Bar Colors

The usage percentage bar is color-coded:
- **Indigo** (< 70%) — healthy
- **Amber** (70–89%) — approaching limit
- **Red** (90%+) — near or at capacity

### Status Badges

- **Green** `active` — Plan is confirmed and operational
- **Amber** `trial` — Community is in its free trial period
- **Red** `expired` — Trial or plan has expired; new joins are blocked

---

## Plan & Trial System

### Plans

| Plan | Slug | Max Homes |
|------|------|-----------|
| Starter | `starter_100` | 100 |
| Growth | `growth_250` | 250 |
| Pro | `pro_500` | 500 |

Plans are managed by community admins from their Admin Console's Billing tab. Super admins can monitor plan status from the Usage Tracking view.

### Free Trial

- Every new community starts with a **14-day free trial**
- During the trial, all features are available and the member limit applies per the selected plan
- A **trial banner** appears in the community dashboard for all members
- When the trial expires:
  - New member joins and invitations are **blocked**
  - Existing members retain full access
  - The community admin must select a plan to restore full functionality

### Plan Enforcement

Member limits are enforced at two points:
1. **Invitation creation** — admins cannot generate invites when at capacity
2. **Join flow** — users cannot complete the join process when the community is full

---

## Common Operations

### "A new HOA wants to onboard"
1. Click **Add Tenant** and create the community
2. Click **Invite** and generate an admin invitation code
3. Send the code to the HOA's designated administrator
4. They sign up at `/join`, land in their dashboard, and can start inviting residents

### "A community's trial expired and they want to continue"
The community admin selects a plan from their Admin Console's Billing tab. If they need assistance, you can:
1. Use **Simulate Login** to enter their dashboard
2. Navigate to Admin Console > Plan & Billing
3. Select the appropriate plan

### "I need to check which communities are running low on capacity"
1. Switch to **Usage Tracking** view
2. Sort by the Usage column — red bars indicate communities near their limit
3. Contact admins of at-risk communities about upgrading

### "A community needs to be shut down"
1. First consider **disabling** the tenant (reversible) — toggle the Active/Disabled badge
2. If permanent removal is needed, click **Delete** and confirm

### "I need to audit platform activity"
Switch to **Usage Tracking** view for a snapshot of all community activity across members, posts, events, listings, messages, and invitations.

---

## Environment Configuration

| Variable | Purpose |
|----------|---------|
| `SUPER_ADMIN_EMAIL` | Additional super admin email (beyond hardcoded list) |
| `DATABASE_URL` | PostgreSQL connection string (required) |

The super admin email allowlist is defined in `app/actions/super-admin.ts`. To add new super admins, add their email to the `SUPER_ADMINS` array or set the `SUPER_ADMIN_EMAIL` environment variable.
