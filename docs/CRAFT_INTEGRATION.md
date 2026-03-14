# Craft.do Integration Setup Guide

This guide explains how to set up the Craft.do integration for KithGrid, allowing community admins to automatically sync HOA documents to their Craft workspace.

## Features

- **OAuth 2.0 Authentication** — Users authorize KithGrid with their Craft.do account securely
- **Auto-Sync Documents** — HOA documents automatically sync to Craft when uploaded
- **Manual Sync** — Admin can manually sync documents and bulk-sync all documents
- **Folder Organization** — Optional: Store synced docs in a specific Craft folder
- **Token Management** — Automatic token refresh when expires

## Prerequisites

1. **Craft.do Account** — Create one at [craft.do](https://craft.do)
2. **Craft.do API Credentials** — Register your app in Craft.do developer settings
3. **Environment Variables** — Set OAuth credentials in `.env.local`

## Step 1: Register OAuth App with Craft.do

1. Go to your Craft.do workspace settings
2. Navigate to **Integrations** → **Developer** → **API Apps**
3. Click **Create New App**
4. Fill in the details:
   - **App Name:** KithGrid
   - **Description:** Community management platform for HOAs
   - **Redirect URI:** `http://localhost:3000/auth/craft/callback` (dev) or your production domain
   - **Scopes:** 
     - `documents:write` — Create/update documents
     - `documents:read` — Read documents
     - `spaces:read` — Read workspace spaces

5. Copy the **Client ID** and **Client Secret**

## Step 2: Set Environment Variables

Add to `.env.local`:

```env
# Craft.do OAuth
CRAFT_CLIENT_ID=your_client_id_here
CRAFT_CLIENT_SECRET=your_client_secret_here
CRAFT_REDIRECT_URI=http://localhost:3000/auth/craft/callback
```

For production, update `CRAFT_REDIRECT_URI` to your production domain:
```env
CRAFT_REDIRECT_URI=https://yourdomain.com/auth/craft/callback
```

## Step 3: Run Database Migration

Add the new `craft_integrations` table to your database:

```bash
npx drizzle-kit push
```

## Step 4: Create OAuth Callback Route

Create `/app/auth/craft/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleCraftCallback } from '@/app/actions/craft';

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const communityId = request.nextUrl.searchParams.get('communityId');

    if (!code || !communityId) {
        return NextResponse.json(
            { error: 'Missing authorization code or community ID' },
            { status: 400 }
        );
    }

    const result = await handleCraftCallback(communityId, code, state || '');

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Redirect to admin panel with success message
    return NextResponse.redirect(
        `${request.nextUrl.origin}/dashboard/admin?craft=connected`
    );
}
```

## Step 5: Add UI to Admin Panel

In `/app/dashboard/admin/page.tsx`, add Craft.do integration section:

```typescript
import { getCraftIntegrationStatus, getCraftAuthUrl } from '@/app/actions/craft';

export default function AdminPage() {
    const [craftStatus, setCraftStatus] = useState(null);

    useEffect(() => {
        const loadCraftStatus = async () => {
            const result = await getCraftIntegrationStatus(user.communityId);
            if (result.success) {
                setCraftStatus(result.data);
            }
        };
        loadCraftStatus();
    }, [user.communityId]);

    const handleConnectCraft = async () => {
        const result = await getCraftAuthUrl(user.communityId);
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        }
    };

    return (
        <div>
            {/* ... existing admin UI ... */}
            
            <div className={styles.section}>
                <h2>Craft.do Integration</h2>
                
                {!craftStatus?.connected && (
                    <button onClick={handleConnectCraft}>
                        Connect Craft.do Workspace
                    </button>
                )}
                
                {craftStatus?.connected && (
                    <div>
                        <p>✅ Connected to: {craftStatus.integration.craftSpaceName}</p>
                        <p>Last sync: {craftStatus.integration.lastSyncAt}</p>
                        <button onClick={() => syncAllDocumentsToCraft(user.communityId)}>
                            Sync All Documents
                        </button>
                        <label>
                            <input
                                type="checkbox"
                                checked={craftStatus.integration.autoSyncDocuments}
                                onChange={(e) => 
                                    toggleCraftAutoSync(user.communityId, e.target.checked)
                                }
                            />
                            Auto-sync new documents
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
```

## Step 6: Auto-Sync on Document Upload

Modify `/app/actions/documents.ts` to trigger sync:

```typescript
export async function createDocument(data: {
    communityId: string;
    name: string;
    category: string;
    filePath: string;
    uploadedBy: string;
}): Promise<DocumentActionState> {
    try {
        // Create document (existing code)
        const [newDoc] = await db.insert(documents).values({
            communityId: data.communityId,
            name: data.name,
            category: data.category,
            url: data.filePath,
            uploaderId: member.id,
        }).returning();

        // Check if Craft integration is enabled
        const [integration] = await db
            .select()
            .from(craftIntegrations)
            .where(
                and(
                    eq(craftIntegrations.communityId, data.communityId),
                    eq(craftIntegrations.autoSyncDocuments, true),
                    eq(craftIntegrations.isActive, true)
                )
            );

        // Auto-sync if enabled
        if (integration) {
            // Fire-and-forget: sync in background without blocking response
            syncDocumentToCraft(data.communityId, newDoc.id).catch(err =>
                console.error('Background sync failed:', err)
            );
        }

        return { success: true, data: newDoc };
    } catch (error) {
        // ... error handling
    }
}
```

## Usage

### For Community Admins

1. **Connect Craft.do:**
   - Go to Admin Panel → Craft.do Integration
   - Click "Connect Craft.do Workspace"
   - Authorize KithGrid to access your Craft workspace
   - Select which space to sync documents to

2. **Upload Documents:**
   - Upload HOA documents as normal
   - If auto-sync is enabled, documents automatically appear in Craft
   - If disabled, use "Sync" button next to each document

3. **Bulk Sync:**
   - Click "Sync All Documents" to sync existing docs
   - Useful for connecting a new workspace

### For Integration Developers

The integration exposes these server actions:

```typescript
// Get OAuth URL for user to click
await getCraftAuthUrl(communityId)

// Handle OAuth callback
await handleCraftCallback(communityId, code, state)

// Check connection status
await getCraftIntegrationStatus(communityId)

// Sync single document
await syncDocumentToCraft(communityId, documentId)

// Sync all documents
await syncAllDocumentsToCraft(communityId)

// Toggle auto-sync
await toggleCraftAutoSync(communityId, enabled)

// Disconnect
await disconnectCraft(communityId)
```

## Security Considerations

- **Token Storage:** Access tokens are encrypted in database (recommend database-level encryption)
- **Token Expiry:** Tokens automatically refresh before expiring
- **OAuth State:** Use cryptographically secure random state for CSRF protection
- **Admin Only:** Only community admins can manage Craft.do integration
- **Scopes:** Requests only minimal needed scopes (documents:read/write, spaces:read)

## Troubleshooting

### "Invalid client_id"
- Check `CRAFT_CLIENT_ID` is set in `.env.local`
- Verify client ID matches Craft developer settings

### "Redirect URI mismatch"
- Ensure `CRAFT_REDIRECT_URI` matches exactly in both Craft settings and `.env.local`
- No trailing slashes

### "No Craft spaces available"
- User must have at least one space in their Craft account
- Create a space at [craft.do](https://craft.do) if needed

### Database errors after enabling
- Run `npx drizzle-kit push` to create the `craft_integrations` table

## Future Enhancements

- [ ] Sync forum discussions to Craft documents
- [ ] Create meeting notes as Craft documents
- [ ] Two-way sync: update Craft docs from KithGrid admin panel
- [ ] Scheduled syncs via cron jobs
- [ ] Bulk document management UI
- [ ] Craft.do collections integration for structured data
