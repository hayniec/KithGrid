# Phase 4: App Store Submission Prep

Configure EAS Build, generate store metadata, and prepare for iOS App Store and Google Play submission.

## Steps

### 1. Configure app.json
Update `apps/mobile/app.json` with full store metadata:
```json
{
  "expo": {
    "name": "KithGrid",
    "slug": "kithgrid",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "kithgrid",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.kithgrid.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "KithGrid uses your camera to take profile photos and share images with neighbors.",
        "NSPhotoLibraryUsageDescription": "KithGrid accesses your photo library to share images with neighbors.",
        "NSContactsUsageDescription": "KithGrid can import emergency contacts from your phone.",
        "NSLocationWhenInUseUsageDescription": "KithGrid uses your location to show nearby neighbors and route emergency alerts.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "KithGrid uses your background location for welfare checks and emergency alerts when the app is closed.",
        "NSFaceIDUsageDescription": "KithGrid uses Face ID to protect your community data."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.kithgrid.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_CONTACTS",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      ["expo-notifications", { "icon": "./assets/notification-icon.png", "color": "#f97316" }],
      ["expo-location", { "locationAlwaysAndWhenInUsePermission": "KithGrid uses your location for emergency alerts and welfare checks." }],
      "expo-image-picker",
      "expo-contacts",
      "expo-local-authentication"
    ]
  }
}
```

### 2. Configure EAS Build
- Install EAS CLI: `npm install -g eas-cli`
- Login: `eas login`
- Create `apps/mobile/eas.json`:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true }
    },
    "preview": {
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "production": {
      "ios": { "autoIncrement": true },
      "android": { "autoIncrement": true }
    }
  },
  "submit": {
    "production": {
      "ios": { "appleId": "APPLE_ID_HERE", "ascAppId": "ASC_APP_ID_HERE", "appleTeamId": "TEAM_ID_HERE" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
}
```

### 3. Generate Asset Placeholders
Create placeholder instructions for required store assets:
- `assets/icon.png` — 1024x1024, KithGrid logo on white background
- `assets/splash.png` — 1284x2778, KithGrid logo centered on white
- `assets/adaptive-icon.png` — 1024x1024, foreground for Android adaptive icon
- `assets/notification-icon.png` — 96x96, monochrome for Android notifications
- iOS screenshots needed: 6.7" (1290x2796), 6.5" (1284x2778), 5.5" (1242x2208)
- Android screenshots: phone (min 320px, max 3840px per side)

### 4. Store Listing Copy
Generate metadata files from existing KithGrid marketing copy:
- **App name**: KithGrid
- **Subtitle** (iOS, 30 chars): "Know your neighbors"
- **Short description** (Android, 80 chars): "Private neighborhood network with emergency SOS alerts and community connection."
- **Full description**: Adapt from the existing landing page and HOA Sales Guide
- **Keywords** (iOS, 100 chars): "neighborhood,HOA,community,emergency,SOS,neighbors,safety,local,alert,preparedness"
- **Category**: Social Networking (primary), Lifestyle (secondary)
- **Privacy Policy URL**: Required — create a simple privacy policy page on the KithGrid web app

### 5. Build Commands
```bash
# Development build (for testing with Expo Dev Client)
eas build --platform all --profile development

# Preview build (for TestFlight / internal testing)
eas build --platform all --profile preview

# Production build (for store submission)
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### 6. Pre-Submission Checklist
- [ ] App icon and splash screen assets created
- [ ] All permission description strings are clear and accurate
- [ ] Privacy policy page published on web app
- [ ] App tested on physical iOS device via TestFlight
- [ ] App tested on physical Android device via internal track
- [ ] Emergency SOS feature works end-to-end (button → notification → recipient)
- [ ] Login/signup flow works for new users
- [ ] Profile creation and editing works
- [ ] Push notifications received when app is backgrounded
- [ ] Deep links from notifications navigate to correct screen
- [ ] No crashes in 24-hour soak test
- [ ] Supabase RLS policies prevent cross-neighborhood data access
- [ ] Store screenshots captured from real app (not mockups)
- [ ] Apple Developer account paid ($99/year)
- [ ] Google Play Console paid ($25 one-time)

## Validation
- `eas build` completes successfully for both platforms
- Preview builds install and run on physical devices
- TestFlight / internal testing builds are accessible to beta testers
- Store listing copy is complete and within character limits
