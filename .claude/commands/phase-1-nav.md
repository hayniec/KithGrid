# Phase 1: Expo Project + Navigation Shell

Initialize the Expo app inside `apps/mobile/` with authentication and tab navigation wired up.

## Steps

1. **Initialize Expo project:**
   ```
   cd apps/mobile
   npx create-expo-app@latest . --template tabs
   ```
   Choose the TypeScript tabs template.

2. **Install core dependencies:**
   ```
   npx expo install expo-secure-store expo-router @supabase/supabase-js
   npx expo install nativewind tailwindcss react-native-reanimated
   npx expo install expo-linking expo-constants expo-status-bar
   npx expo install react-native-safe-area-context react-native-screens
   ```

3. **Configure NativeWind:**
   - Create `tailwind.config.js` pointing to `app/**/*.tsx` and `components/**/*.tsx`
   - Add the babel preset for NativeWind
   - This lets us use `className="bg-white rounded-2xl p-4"` syntax in React Native

4. **Set up environment variables:**
   - Create `apps/mobile/.env`:
     ```
     EXPO_PUBLIC_SUPABASE_URL=<same URL as web app>
     EXPO_PUBLIC_SUPABASE_ANON_KEY=<same key as web app>
     ```

5. **Create the Supabase client for mobile:**
   - Create `apps/mobile/lib/supabase.ts`
   - Import the factory from `@kithgrid/shared` and pass `expo-secure-store` as the storage adapter
   - Use `createClient` with the `EXPO_PUBLIC_` env vars
   - Configure auth with `storage: SecureStoreAdapter`, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`

6. **Create the auth context:**
   - Create `apps/mobile/lib/auth-context.tsx`
   - Port from web's `auth-context.js` but use the mobile Supabase client
   - Wrap the app in `<AuthProvider>` in the root layout
   - Expose `user`, `session`, `signIn`, `signUp`, `signOut`

7. **Set up Expo Router tab navigation:**
   - `apps/mobile/app/_layout.tsx` — Root layout with AuthProvider, redirect to login if no session
   - `apps/mobile/app/login.tsx` — Simple email/password login screen
   - `apps/mobile/app/(tabs)/_layout.tsx` — Tab navigator with 5 tabs:
     - Feed (home icon) — `index.tsx`
     - Neighbors (users icon) — `neighbors.tsx`
     - SOS (alert-circle icon, red tint) — `sos.tsx`
     - Messages (message-circle icon) — `messages.tsx`
     - Profile (user icon) — `profile.tsx`
   - Each tab screen starts as a placeholder with the tab name centered on screen

8. **Tab bar styling:**
   - White background, top border gray-100
   - Active tab: orange-500 icon + label
   - Inactive tab: gray-400 icon + label
   - SOS tab: always red icon regardless of active state
   - Use Lucide React Native icons (install `lucide-react-native` + `react-native-svg`)

## Validation
- `npx expo start` launches without errors
- Login screen appears when not authenticated
- After login, tab bar shows all 5 tabs and you can navigate between them
- Each tab displays its placeholder text
- Session persists across app restarts (SecureStore working)
- Logout returns to login screen
