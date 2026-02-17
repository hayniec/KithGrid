# Dashboard with HOA Tabs - Implementation Plan

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  Welcome back, [User]!                          │
│  Here's what's happening in [Community]         │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Upcoming    │  │ Announcements│            │
│  │  Events      │  │              │            │
│  └──────────────┘  └──────────────┘            │
├─────────────────────────────────────────────────┤
│  Community Information                          │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │Community │  Rules   │ Services │Documents │ │
│  │   Info   │          │          │          │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│  [Active Tab Content]                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Tab Contents

### Tab 1: Community Info
- Community contact information
- HOA dues details
- Board members/officers
- Community amenities (Pool, Clubhouse, Tennis, Fitness)

### Tab 2: Rules & Guidelines
- Property Maintenance rules
- Parking & Vehicles rules
- Pet policies
- Noise & Nuisance policies

### Tab 3: Service Providers
- Landscaping
- Pool Maintenance
- Security
- Property Management

### Tab 4: Documents & Resources
- Upload functionality (for admins)
- Document list with download
- CC&Rs, Bylaws, etc.

## Implementation Steps

1. ✅ Add tab state to dashboard
2. ✅ Create tab navigation UI
3. ✅ Import HOA content from hoa/page.tsx
4. ✅ Render content based on active tab
5. ✅ Remove HOA link from sidebar
6. ✅ Update routing (optional: keep /dashboard/hoa as redirect)

## Files to Modify

- `app/dashboard/page.tsx` - Add tabs and HOA content
- `components/dashboard/Sidebar.tsx` - Remove HOA link
- `app/dashboard/hoa/page.tsx` - Keep or redirect to dashboard

## Benefits

✅ Single-page dashboard experience
✅ All community info in one place
✅ Better mobile UX with tabs
✅ Cleaner navigation
