# Phase 3: Native Feature — $ARGUMENTS

Implement the specified native-only feature using the appropriate Expo module.

## Feature Implementations

When the argument is **push-notifications**:
- Module: `expo-notifications`
- Install: `npx expo install expo-notifications expo-device expo-constants`
- Implementation:
  1. Create `apps/mobile/lib/notifications.ts`
  2. Register for push notifications on app launch (request permission, get ExpoPushToken)
  3. Store the push token in Supabase `profiles` table (add `push_token` column if needed — create migration in `apps/web/supabase/04-push-tokens.sql`)
  4. Create notification handler for foreground notifications (show in-app alert)
  5. Create background notification handler
  6. For SOS alerts: when a user triggers SOS, query all neighbor push tokens from Supabase and send via Expo Push API
  7. Create `apps/mobile/lib/send-sos-notification.ts` that calls the Expo push endpoint
  8. Deep link from notification tap → SOS screen or conversation
- Config: Add notification permissions to `app.json` under `expo.plugins`
- **Important**: SOS notifications should use `priority: 'high'` and `sound: 'default'` to break through Do Not Disturb where possible

When the argument is **background-location**:
- Module: `expo-location`
- Install: `npx expo install expo-location expo-task-manager`
- Implementation:
  1. Create `apps/mobile/lib/location.ts`
  2. Request foreground location permission first, then background
  3. Define a background task with `TaskManager.defineTask` that updates the user's location in Supabase periodically (every 5 min when backgrounded)
  4. Add a `last_location` (PostGIS point or lat/lng columns) to `profiles` if not present
  5. Use location data for: nearest-neighbor SOS routing, welfare check proximity, showing distance in neighbor directory
  6. Add a privacy toggle in Profile settings — user can disable location sharing
- Config: Add location permissions strings to `app.json` (both iOS and Android descriptions)
- **Important**: Be transparent about location usage — only collect when the user has explicitly opted in

When the argument is **haptics**:
- Module: `expo-haptics`
- Install: `npx expo install expo-haptics`
- Implementation:
  1. Add haptic feedback to existing components:
     - SOS button press: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)` on press-in
     - SOS confirmation: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)` when alert is sent
     - Send message: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
     - Like a post: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
     - Tab switch: `Haptics.selectionAsync()` (subtle)
  2. Wrap all haptic calls in a try/catch (graceful degradation on devices without haptic hardware)
  3. Add a "Haptic feedback" toggle in Profile settings, stored in AsyncStorage

When the argument is **contacts-import**:
- Module: `expo-contacts`
- Install: `npx expo install expo-contacts`
- Implementation:
  1. On the SOS/Emergency Contacts screen, add an "Import from phone" button
  2. Request contacts permission when tapped
  3. Open a contact picker (or list contacts with search)
  4. When user selects a contact, pre-fill the emergency contact form with name + phone
  5. User confirms and saves to Supabase `emergency_contacts` table
  6. Show imported contacts in the existing emergency contacts list

When the argument is **image-picker**:
- Module: `expo-image-picker`
- Install: `npx expo install expo-image-picker`
- Implementation:
  1. Profile photo: tap avatar on Profile screen → show action sheet (Camera / Library / Remove)
  2. Feed post: add image attachment button to post composer
  3. Upload flow: pick image → resize to max 1024px → upload to Supabase Storage bucket `avatars` or `post-images` → save public URL to profile/post record
  4. Create `apps/mobile/lib/image-upload.ts` with `uploadImage(bucket, uri)` helper
  5. Show upload progress indicator
  6. Handle permissions for both camera and media library

When the argument is **biometric-auth**:
- Module: `expo-local-authentication`
- Install: `npx expo install expo-local-authentication`
- Implementation:
  1. On app launch (when session exists), prompt for Face ID / fingerprint before showing content
  2. Check `LocalAuthentication.hasHardwareAsync()` and `isEnrolledAsync()` first
  3. If biometrics unavailable, fall back to normal session-based auth (no extra prompt)
  4. Add "Require Face ID / Fingerprint" toggle in Profile settings
  5. Store the preference in expo-secure-store
  6. The auth gate lives in `app/_layout.tsx` — show biometric prompt before rendering tab navigator

## General Rules
1. Always check if the feature's hardware/permission is available before attempting to use it
2. Provide graceful fallbacks — the app must work without any single native feature
3. Add appropriate permission descriptions in `app.json` for iOS (NSCameraUsageDescription, NSContactsUsageDescription, NSLocationWhenInUseUsageDescription, etc.)
4. Test on both iOS and Android — some features behave differently across platforms
5. If a Supabase schema change is needed, create the migration SQL file and document it clearly

## Validation
- Feature works on iOS (Expo Go or dev build)
- Feature works on Android (Expo Go or dev build)
- Permissions are requested gracefully with clear explanations
- Feature degrades gracefully when permission is denied
- Settings toggle correctly enables/disables the feature
- No crashes when hardware is unavailable
