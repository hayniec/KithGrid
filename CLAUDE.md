# KithGrid — Claude Code Project Context

## What is KithGrid?
KithGrid (formerly NeighborNet) is a private neighborhood social network and emergency preparedness platform for HOA communities. It combines everyday neighbor connection with emergency response features like one-tap SOS alerts, a skills/resource registry, and welfare checks.

## Architecture Overview

### Current State: Next.js PWA (marketing site + admin dashboard)
- **Framework:** Next.js (React)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Netlify
- **PWA:** Service worker + manifest.json

### Migration Target: Expo (React Native) mobile app
- **Framework:** Expo SDK with Expo Router (file-based routing)
- **Backend:** Same Supabase instance (shared with Next.js site)
- **Styling:** NativeWind (Tailwind syntax for React Native)
- **Icons:** Lucide React Native
- **Auth Storage:** expo-secure-store (replaces localStorage)
- **Build:** EAS Build (cloud builds, no local Xcode/Android Studio required)

### Monorepo Structure (target)
```
kithgrid/
├── apps/
│   ├── web/                  # Existing Next.js site (marketing + admin)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   └── package.json
│   └── mobile/               # New Expo app (resident experience)
│       ├── app/              # Expo Router file-based routes
│       │   ├── (tabs)/       # Tab navigator group
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx       # Feed
│       │   │   ├── neighbors.tsx   # Directory
│       │   │   ├── sos.tsx         # Emergency
│       │   │   ├── messages.tsx    # DMs
│       │   │   └── profile.tsx     # Profile
│       │   ├── _layout.tsx   # Root layout (auth gate)
│       │   ├── login.tsx
│       │   └── conversation/
│       │       └── [id].tsx  # Individual conversation
│       ├── components/       # React Native components
│       ├── lib/              # Shared logic (copied from web, adapted)
│       ├── app.json
│       └── package.json
├── packages/
│   └── shared/               # Shared Supabase client, types, constants
│       ├── supabase.ts
│       ├── store.ts
│       ├── realtime-alerts.ts
│       ├── resource-types.ts
│       ├── resource-store.ts
│       └── types.ts
├── CLAUDE.md                 # This file
└── package.json              # Workspace root
```

## Supabase Schema (current)
Key tables — all have RLS policies enabled:

- **neighborhoods** — id, name, description, city, state, zip_code
- **profiles** — id (FK to auth.users), full_name, avatar_url, address, phone, neighborhood_id, is_online, bio
- **skills** — id, name, category
- **user_skills** — user_id, skill_id (junction table)
- **posts** — id, user_id, neighborhood_id, content, image_url, post_type (general/alert/event), created_at
- **post_likes** — post_id, user_id
- **post_comments** — id, post_id, user_id, content
- **conversations** — id, created_at
- **conversation_participants** — conversation_id, user_id
- **messages** — id, conversation_id, sender_id, content, created_at
- **emergency_contacts** — id, user_id, name, phone, relation
- **resources** — id, user_id, neighborhood_id, name, description, category, available

SQL migrations are in: `apps/web/supabase/01-schema.sql`, `02-schema-v2.sql`, `03-schema-resources.sql`

## Design Conventions

### Colors
- Primary accent: Orange (#f97316 / Tailwind orange-500)
- Emergency/SOS: Red (#ef4444 / red-500)
- Success/online: Emerald (#10b981 / emerald-500)
- Backgrounds: White cards on gray-50 page background
- Text: gray-900 headings, gray-500 secondary, gray-400 hints

### Component Patterns (web → native mapping)
| Web pattern | Native equivalent |
|-------------|-------------------|
| `<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">` | `<View style={styles.card}>` with `{backgroundColor:'#fff', borderRadius:16, padding:16, borderWidth:1, borderColor:'#f3f4f6'}` |
| `<button className="... rounded-xl font-semibold">` | `<Pressable style={styles.button}>` |
| Tailwind `className` strings | NativeWind `className` (same syntax) OR `StyleSheet.create()` |
| `<img>` with Tailwind sizing | `<Image>` with explicit `width`/`height` style |
| CSS `animate-slide-up` | `react-native-reanimated` FadeInUp |
| `overflow-hidden` scroll areas | `<FlatList>` or `<ScrollView>` |
| `position: fixed` bottom nav | Expo Router `<Tabs>` component |
| `window.confirm()` / HTML `<dialog>` | React Native `<Modal>` |

### Avatar Component Convention
- Circular image with colored border
- Green dot overlay (absolute positioned) when `is_online` is true
- Fallback: colored circle with initials derived from `full_name`

### Card Convention
- White background, border-radius 16, 1px gray-100 border
- 16px internal padding
- Optional gradient header for emphasis (e.g., SOS card uses red gradient)

## Migration Phases

### Phase 0 — Shared backend (no code changes to Supabase)
The Expo app connects to the exact same Supabase project. No schema changes, no new RLS policies, no backend work.

### Phase 1 — Expo project + navigation shell
- Initialize Expo project with TypeScript
- Install core deps: @supabase/supabase-js, expo-secure-store, expo-router, nativewind
- Set up tab navigation matching current bottom nav: Feed, Neighbors, SOS, Messages, Profile
- Port auth-context.js (swap localStorage → SecureStore)
- Port supabase.js client config

### Phase 2 — Component-by-component port
Port order (easiest first to establish patterns):
1. Avatar
2. SkillBadge
3. Feed (FlatList + post cards)
4. NeighborDirectory (search + FlatList)
5. Emergency SOS (Pressable + Modal + haptics)
6. Messages list
7. ConversationView (inverted FlatList + KeyboardAvoidingView)
8. Profile / Settings

### Phase 3 — Native-only features
- expo-notifications (push notifications for SOS alerts)
- expo-location (background location for welfare checks)
- expo-haptics (SOS button confirmation)
- expo-contacts (import emergency contacts from phone)
- expo-image-picker (profile photos, feed images)
- expo-local-authentication (biometric unlock)

### Phase 4 — App store submission
- Configure app.json with store metadata
- EAS Build for iOS and Android
- TestFlight + internal testing track
- Store screenshots and descriptions (reuse landing page copy)
- Submit for review

## Key Files That Port Without Changes
These files contain pure JS/Supabase logic with no DOM or CSS dependencies:
- `lib/store.js` — data fetching functions (getNeighbors, getPosts, etc.)
- `lib/realtime-alerts.js` — Supabase realtime subscriptions
- `lib/resource-types.js` — resource category constants
- `lib/resource-store.js` — resource CRUD operations

## Key Files That Need Adaptation
- `lib/supabase.js` — swap AsyncStorage/SecureStore for localStorage
- `lib/auth-context.js` — swap storage backend, add SecureStore token persistence
- `components/features-v2.js` — main UI (this is the big rewrite, split into individual native components)

## Commands
Custom slash commands are in `.claude/commands/`. Use them to execute each migration phase.

## Important Notes
- Always use TypeScript (.tsx) for new Expo files
- Use NativeWind for styling (keeps Tailwind syntax familiar)
- Test on both iOS and Android after each component port
- The Next.js web app continues to work independently — don't break it
- Supabase environment variables: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (Expo uses EXPO_PUBLIC_ prefix instead of NEXT_PUBLIC_)
