# KithGrid Administrator Guide

This guide is for **community administrators** — users who manage a single neighborhood or HOA within KithGrid. You have access to everything a regular resident can do, plus the Admin Console.

---

## Accessing the Admin Console

**Path:** `/dashboard/admin`

The Admin Console is available to users with the **Admin** or **Board Member** role. It contains five tabs:

- Configuration
- User Management
- Invitations
- Resources
- Plan & Billing

---

## Configuration Tab

### Branding & Appearance

Customize how your community looks across the platform:

- **Community Logo** — Upload or set a logo URL
- **Primary Color** — The main accent color used for buttons, links, and highlights
- **Secondary Color** — Used for sidebar and secondary UI elements
- **Accent Color** — Used for progress bars, badges, and emphasis

Click **Save Branding** to persist changes to the database. All community members will see the updated branding.

### HOA Settings

Configure your HOA's financial and contact details:

| Field | Description |
|-------|-------------|
| Dues Amount | Monthly/quarterly/annual HOA fee |
| Frequency | Monthly, Quarterly, or Annual |
| Due Date | Day of the month dues are due |
| Contact Email | HOA's official contact email |

Click **Save HOA Settings** to persist.

### Extended Settings

Manage additional community configuration:

- **Amenities** — Add community amenities (pool, gym, clubhouse) with icons, hours, and notes
- **Community Rules** — Define and publish community rules
- **Approved Vendors** — Maintain a list of HOA-approved vendors

---

## User Management Tab

View and manage all members in your community.

### Member List
- See every member's **name, role, address, email, and join date**
- **Search** members by name

### Editing Members
- Click **Edit** on any member to:
  - Change their **role** (Resident, Admin, Board Member, Event Manager)
  - Update their **address**
  - Mark them as an **HOA Officer** and assign a position (President, Treasurer, etc.)

### Removing Members
- Click **Delete** to remove a member from the community
- This is permanent — they would need a new invitation to rejoin

---

## Invitations Tab

Control who joins your community.

### Creating Invitations
1. Enter the **email address** of the person you want to invite
2. Select their **role** (defaults to Resident)
3. Click **Generate Invitation**
4. A unique **6-character code** is generated and emailed to them
5. Share the code — they use it at `/join` to sign up

### Bulk Import
1. Click **Import CSV**
2. Upload a CSV file with columns: `email` and optionally `name`
3. Invitations are generated for all rows
4. Each person receives a unique code

### Managing Invitations
- View all invitations with their **status**: Pending, Used, or Expired
- **Delete** invitations that are no longer needed
- **Copy** invitation codes to share manually

### Member Limits
Invitations are blocked when your community reaches its **plan's member limit**. You'll see an error message indicating the current count vs. the maximum. Upgrade your plan in the Billing tab to allow more members.

---

## Resources Tab

Manage shared community assets (facilities, tools, vehicles).

### Adding Resources
1. Click **Add New Resource**
2. Fill in:
   - **Name** (e.g., "Community Pool", "Pressure Washer")
   - **Type** (Facility, Tool, or Vehicle)
   - **Capacity** (for facilities)
   - **Description**
3. The resource becomes available for members to reserve

### Deleting Resources
- Click **Delete** next to any resource to remove it
- Existing reservations for that resource are also removed

---

## Plan & Billing Tab

Monitor and manage your community's subscription plan.

### Current Usage
- **Member count** vs. plan limit, shown as a progress bar
- Color-coded warnings:
  - **Green** — plenty of room
  - **Yellow** — approaching limit (80%+)
  - **Red** — at capacity
- Current **plan name** and **status** (Active, Trial, or Expired)

### Trial Period
New communities start with a **14-day free trial** with full access. During the trial:

- A **yellow banner** shows how many days remain
- All features are fully functional
- When the trial expires, the banner turns **red** and new members cannot join

### Choosing a Plan

| Plan | Max Homes | Best For |
|------|-----------|----------|
| Starter | 100 | Small neighborhoods |
| Growth | 250 | Mid-size communities |
| Pro | 500 | Large HOAs and condo associations |

- Click a plan to **upgrade or downgrade**
- You **cannot downgrade** below your current member count (remove members first)
- Selecting a plan sets your status to **Active** and clears the trial

### Trial Expired?
If your trial has expired and no plan is selected:
- New members **cannot join** (invitations and join requests are blocked)
- Existing members retain access to all features
- Select a plan to restore full functionality

---

## Role Reference

| Role | Can they... | Admin Console | Create Events | Manage Members | Send Invites |
|------|------------|---------------|---------------|----------------|-------------|
| Resident | Use all community features | No | No | No | No |
| Event Manager | Create and delete events | No | Yes | No | No |
| Board Member | View invitations, manage members | Partial | Yes | Yes | No |
| Admin | Full admin access | Yes | Yes | Yes | Yes |

---

## Common Tasks

### "A resident needs to be removed"
1. Go to **User Management** tab
2. Find the member
3. Click **Delete** and confirm

### "We need to change our HOA dues"
1. Go to **Configuration** tab
2. Update the dues amount, frequency, or due date
3. Click **Save HOA Settings**

### "We're running out of member slots"
1. Go to **Plan & Billing** tab
2. Review current usage
3. Click **Upgrade** on a higher plan

### "A new board member was elected"
1. Go to **User Management** tab
2. Find the member and click **Edit**
3. Change their role to **Board Member**
4. Toggle **HOA Officer** on and enter their position
5. Save changes
