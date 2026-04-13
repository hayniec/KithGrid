# Phase 0: Project Structure Setup

Set up the KithGrid monorepo structure for the Expo migration. This phase creates the workspace layout without modifying any existing web code.

## Steps

1. **Create the monorepo workspace structure:**
   - Move all existing Next.js files into `apps/web/` (preserve git history)
   - Create `apps/mobile/` directory for the Expo app
   - Create `packages/shared/` for code shared between web and mobile
   - Add a root `package.json` with workspace configuration

2. **Extract shared code into `packages/shared/`:**
   - Copy `lib/store.js` → `packages/shared/store.ts` (convert to TypeScript, remove any DOM refs)
   - Copy `lib/realtime-alerts.js` → `packages/shared/realtime-alerts.ts`
   - Copy `lib/resource-types.js` → `packages/shared/resource-types.ts`
   - Copy `lib/resource-store.js` → `packages/shared/resource-store.ts`
   - Create `packages/shared/supabase.ts` with a factory function that accepts a storage adapter (so web passes localStorage and mobile passes SecureStore)
   - Create `packages/shared/types.ts` with TypeScript interfaces for all Supabase table rows (Profile, Post, Conversation, Message, Skill, EmergencyContact, Resource, Neighborhood)
   - Add a `packages/shared/package.json` with name `@kithgrid/shared`

3. **Update `apps/web/` imports:**
   - Update the web app's imports to reference `@kithgrid/shared` instead of local `lib/` files where applicable
   - Verify the web app still builds and runs correctly after the import changes

4. **Root workspace config:**
   - Root `package.json` should use npm/yarn/pnpm workspaces pointing to `apps/*` and `packages/*`
   - Add root scripts: `dev:web`, `dev:mobile`, `build:web`, `build:mobile`

## Validation
- Run `npm run dev:web` (or equivalent) and confirm the existing Next.js app works unchanged
- Confirm `packages/shared/` exports are importable from both `apps/web/` and `apps/mobile/`
- No Supabase schema changes needed
