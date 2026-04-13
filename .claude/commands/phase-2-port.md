# Phase 2: Port Component — $ARGUMENTS

Port the specified web component from `apps/web/components/features-v2.js` to a React Native component in `apps/mobile/components/`.

## Context
The web app's UI lives primarily in `components/features-v2.js` as one large file with multiple component functions. Each component needs to be extracted into its own file in the mobile app.

## Component Mapping Reference

When the argument is **Avatar**:
- Source: `Avatar` function in features-v2.js
- Target: `apps/mobile/components/Avatar.tsx`
- Key changes: `<img>` → `<Image>`, CSS border-radius → `borderRadius: 999`, online dot as absolute-positioned `<View>`
- Props: `name: string, url?: string, size?: 'sm' | 'md' | 'lg', online?: boolean`

When the argument is **SkillBadge**:
- Source: `SkillBadge` function in features-v2.js
- Target: `apps/mobile/components/SkillBadge.tsx`
- Key changes: Pill-shaped `<View>` with `<Text>`, color derived from skill category
- Props: `skill: { name: string, category?: string }`

When the argument is **Feed**:
- Source: `FeedView` function in features-v2.js
- Target: `apps/mobile/components/Feed.tsx`
- Key changes: Scrollable post list → `<FlatList>`, pull-to-refresh via `onRefresh`, post cards as `<View>` with Avatar + content + like/comment actions
- Data: Use `getPosts()` from `@kithgrid/shared/store`
- Realtime: Subscribe to new posts via `@kithgrid/shared/realtime-alerts`

When the argument is **NeighborDirectory**:
- Source: `NeighborsView` function in features-v2.js
- Target: `apps/mobile/components/NeighborDirectory.tsx`
- Key changes: Search input → `<TextInput>`, neighbor list → `<FlatList>`, each item shows Avatar + name + address + skills + message button
- Data: Use `getNeighbors()` from `@kithgrid/shared/store`
- Navigation: Message button navigates to conversation screen

When the argument is **SOS**:
- Source: `EmergencyView` function in features-v2.js
- Target: `apps/mobile/components/SOSScreen.tsx`
- Key changes:
  - Big SOS button → `<Pressable>` with `expo-haptics` heavy impact on press
  - Confirmation dialog → React Native `<Modal>`
  - Emergency contacts list from Supabase
  - "Neighbors with medical training" section using skill filter
  - "Neighbors with generators" section
  - Phone call links: `Linking.openURL('tel:${phone}')`
- This is the most important screen — make the SOS button large, centered, unmissable

When the argument is **MessagesList**:
- Source: `MessagesView` function in features-v2.js
- Target: `apps/mobile/components/MessagesList.tsx`
- Key changes: Conversation list → `<FlatList>`, each row shows Avatar + name + last message preview + timestamp
- Data: Use conversation queries from `@kithgrid/shared/store`
- Navigation: Tap navigates to `conversation/[id]` route

When the argument is **ConversationView**:
- Source: `ConversationView` function in features-v2.js
- Target: `apps/mobile/components/ConversationView.tsx`
- Key changes:
  - Message list → inverted `<FlatList>` (newest at bottom)
  - Input area → `<TextInput>` inside `<KeyboardAvoidingView>` (critical for iOS)
  - Real-time messages via Supabase realtime subscription
  - Send button with `sendMessage()` from shared store
- This screen uses Expo Router's stack navigation: `app/conversation/[id].tsx`

When the argument is **Profile**:
- Source: Profile/settings portion of features-v2.js
- Target: `apps/mobile/components/ProfileScreen.tsx`
- Sections: Avatar + name display, edit profile form, skills management, emergency contacts management, sign out button
- Forms use `<TextInput>` with labels

## General Rules for All Ports
1. Use TypeScript (.tsx)
2. Use NativeWind className syntax for styling (mirrors existing Tailwind classes)
3. Import types from `@kithgrid/shared/types`
4. Import data functions from `@kithgrid/shared/store`
5. Use `expo-haptics` for tactile feedback on important actions (SOS, send message)
6. Animations: use `react-native-reanimated` FadeInUp/FadeInDown for list items
7. Loading states: use `<ActivityIndicator>` from react-native
8. Empty states: centered icon + text (match web app's pattern)
9. Error handling: try/catch around all Supabase calls, show user-friendly error text

## Validation
- Component renders without errors on both iOS and Android (test via Expo Go)
- Data loads from Supabase and displays correctly
- Interactive elements (buttons, inputs, navigation) work as expected
- Styling matches the web app's visual feel (white cards, orange accents, rounded corners)
- Pull-to-refresh works on list screens
