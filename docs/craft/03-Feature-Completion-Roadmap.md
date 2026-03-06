# Feature Completion Roadmap

## Status Legend
- DONE — Fully implemented and working
- NEEDS WORK — Partially built, needs updates for multi-tenant-first
- NEW — Does not exist yet, must be built

---

## Priority 1: Multi-Tenancy Gateway (Critical Path)

These items must be completed before anything else. Without them, the app cannot function as a true multi-tenant platform.

| # | Item | Status | Files Affected |
|---|------|--------|----------------|
| 1.1 | Community selection page (`/select-community`) | NEW | `app/select-community/page.tsx` |
| 1.2 | Community creation wizard (`/create-community`) | NEW | `app/create-community/page.tsx` |
| 1.3 | Redirect login to `/select-community` | NEEDS WORK | `app/login/page.tsx` |
| 1.4 | Redirect join to `/select-community` | NEEDS WORK | `app/join/page.tsx` |
| 1.5 | Remove hardcoded community ID fallback | NEEDS WORK | `contexts/UserContext.tsx` |
| 1.6 | Middleware guard (no dashboard without community) | NEEDS WORK | `middleware.ts` |
| 1.7 | Community switcher component | NEW | `components/dashboard/CommunitySwitcher.tsx` |
| 1.8 | `switchCommunity()` function in UserContext | NEEDS WORK | `contexts/UserContext.tsx` |
| 1.9 | Join additional community page | NEW | `app/join-community/page.tsx` |
| 1.10 | Cookie-based community persistence | NEW | `middleware.ts`, `UserContext.tsx` |

**Estimated effort:** This is the largest single block of work remaining.

---

## Priority 2: Authentication & Security Hardening

| # | Item | Status | Notes |
|---|------|--------|-------|
| 2.1 | Supabase Auth (email/password + Google OAuth) | DONE | Working |
| 2.2 | Facebook OAuth | DONE | Code exists, currently commented out in UI |
| 2.3 | Apple OAuth | DONE | Code exists, currently commented out in UI |
| 2.4 | Invitation code validation on join | DONE | Working |
| 2.5 | Remove mock/bypass user in UserContext | NEEDS WORK | Lines 117-131 in UserContext.tsx — gate behind `NODE_ENV` |
| 2.6 | Password reset flow | NEW | Supabase supports this, needs UI page |
| 2.7 | Email verification on signup | NEW | Supabase supports this, needs configuration |
| 2.8 | Session refresh handling | DONE | Supabase middleware handles this |

---

## Priority 3: Core Community Features

All features below are already built and functional. Listed for completeness.

| Feature | Status | Key Files |
|---------|--------|-----------|
| Dashboard with stats | DONE | `app/dashboard/page.tsx` |
| Neighbor directory | DONE | `app/dashboard/neighbors/page.tsx` |
| Forum (posts, comments, likes) | DONE | `app/dashboard/forum/page.tsx` |
| Events with RSVP | DONE | `app/dashboard/events/page.tsx` |
| Marketplace (buy/sell, 30-day expiry) | DONE | `app/dashboard/marketplace/page.tsx` |
| Direct messaging | DONE | `app/dashboard/messages/page.tsx` |
| Resource reservations | DONE | `app/dashboard/resources/page.tsx` |
| HOA documents | DONE | `app/dashboard/documents/page.tsx` |
| HOA info page | DONE | `app/dashboard/hoa/page.tsx` |
| Service providers | DONE | `app/dashboard/services/page.tsx` |
| Local guide | DONE | `app/dashboard/local/page.tsx` |
| Announcements (scheduled, expiring) | DONE | `app/dashboard/page.tsx` (dashboard) |
| Admin console | DONE | `app/dashboard/admin/page.tsx` |
| Super admin panel | DONE | `app/super-admin/page.tsx` |
| User settings | DONE | `app/dashboard/settings/page.tsx` |

---

## Priority 4: Remaining Feature Gaps

| # | Item | Status | Notes |
|---|------|--------|-------|
| 4.1 | Emergency SOS button UI | NEEDS WORK | Foundation in UserContext, needs floating button component |
| 4.2 | Email notifications via Resend | NEEDS WORK | Resend API configured, needs templates + triggers |
| 4.3 | Invitation email sending | NEW | Template + Resend integration |
| 4.4 | New community onboarding checklist | NEW | Dashboard banner for admin setup tasks |
| 4.5 | Role helper application to remaining 7 UI files | NEEDS WORK | Per MULTI_ROLE_AUDIT.md |
| 4.6 | HOA dynamic rules/vendors sections | NEEDS WORK | Per HOA_DYNAMIC_IMPLEMENTATION.md |
| 4.7 | Image upload for marketplace items | NEEDS WORK | Schema supports `images` array, needs upload UI |
| 4.8 | Community logo upload | NEW | Supabase Storage integration |
| 4.9 | Notification system (in-app) | NEW | For new messages, forum replies, event reminders |

---

## Priority 5: Billing & Monetization

| # | Item | Status | Notes |
|---|------|--------|-------|
| 5.1 | Stripe integration for community billing | NEW | Schema has `stripeCustomerId`, `stripeSubscriptionId` placeholders |
| 5.2 | Plan enforcement (max homes limit) | NEW | Schema has `maxHomes` field |
| 5.3 | Plan upgrade/downgrade flow | NEW | |
| 5.4 | Usage tracking dashboard (super admin) | NEW | |
| 5.5 | Free trial period logic | NEW | |

---

## Priority 6: Mobile App

| # | Item | Status | Notes |
|---|------|--------|-------|
| 6.1 | React Native (Expo) scaffold | DONE | `kithgrid-mobile/` directory |
| 6.2 | Android Capacitor wrapper | DONE | `android/` directory |
| 6.3 | Mobile community selection | NEW | Must mirror web tenant-first flow |
| 6.4 | Push notifications | NEW | Expo Push or Firebase Cloud Messaging |
| 6.5 | Offline support | NEW | |

---

## Priority 7: Polish & Production Readiness

| # | Item | Status | Notes |
|---|------|--------|-------|
| 7.1 | Landing page redesign | NEEDS WORK | Current page is minimal |
| 7.2 | Error boundaries | NEW | Graceful error handling in React |
| 7.3 | Loading states / skeletons | NEEDS WORK | Some pages have loading, others don't |
| 7.4 | Accessibility audit (WCAG) | NEW | |
| 7.5 | SEO meta tags | NEW | |
| 7.6 | Rate limiting on API actions | NEW | |
| 7.7 | Input sanitization audit | NEW | Prevent XSS in forum, messages |
| 7.8 | Logging and monitoring (Sentry/LogRocket) | NEW | |
| 7.9 | Automated tests | NEW | |
| 7.10 | CI/CD pipeline | NEW | GitHub Actions |

---

## Recommended Build Order

```
Sprint 1: Multi-Tenancy Gateway (Priority 1)
    → This unlocks everything. Ship the community selector,
      switcher, and remove hardcoded IDs.

Sprint 2: Auth Hardening + Email (Priority 2 + 4.2/4.3)
    → Password reset, email verification, invitation emails

Sprint 3: Feature Gaps (Priority 4)
    → Emergency button, notifications, image uploads,
      role helper cleanup

Sprint 4: Billing (Priority 5)
    → Stripe integration, plan enforcement

Sprint 5: Polish (Priority 7)
    → Error handling, accessibility, tests, CI/CD

Sprint 6: Mobile (Priority 6)
    → Native flows mirroring web
```
