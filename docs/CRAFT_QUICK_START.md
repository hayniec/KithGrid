# Quick Integration Checklist

Complete these steps to enable Craft.do document syncing in KithGrid:

## 1. ✅ Database Migration
```bash
npx drizzle-kit push
```
This creates the `craft_integrations` table needed to store connection details.

## 2. ✅ Environment Variables
Copy the environment template and add your credentials:
```bash
cp .env.craft.example .env.local  # Append to existing .env.local
```

Then fill in the OAuth credentials from Craft developer settings:
```
CRAFT_CLIENT_ID=your_client_id
CRAFT_CLIENT_SECRET=your_client_secret
CRAFT_REDIRECT_URI=http://localhost:3000/auth/craft/callback
```

## 3. ✅ OAuth Callback Route
The route handler is already created at:
- `/app/auth/craft/callback/route.ts`

No additional setup needed!

## 4. ✅ Add to Admin Panel
In your admin page component, import and add the Craft integration panel:

```typescript
import { CraftIntegrationPanel } from '@/components/dashboard/CraftIntegrationPanel';

export default function AdminPage() {
    const { user } = useUser();

    return (
        <div className={styles.container}>
            {/* ... existing admin sections ... */}
            
            {/* Add this section */}
            <CraftIntegrationPanel 
                communityId={user?.communityId!}
                onStatusChange={(connected) => {
                    console.log('Craft connected:', connected);
                }}
            />
        </div>
    );
}
```

## 5. ✅ Test the Integration

### Local Testing
1. Start dev server: `npm run dev`
2. Go to admin panel
3. Click "Connect Craft Workspace"
4. Authorize KithGrid in Craft
5. You should be redirected back to admin with success message

### Verify in Craft
After connecting:
- Check your Craft workspace
- New folder appears: "KithGrid Documents"
- Upload a document in KithGrid admin panel
- If auto-sync enabled, it should appear in Craft within seconds

## 6. ✅ Production Deployment

Update environment variables for production domain:
```
CRAFT_REDIRECT_URI=https://yourdomain.com/auth/craft/callback
```

And update the redirect URI in Craft developer settings to match.

## Files Created/Modified

### New Files
- ✅ `utils/integrations/craft.ts` — Craft.do API client
- ✅ `app/actions/craft.ts` — Server actions for integration
- ✅ `app/auth/craft/callback/route.ts` — OAuth callback handler
- ✅ `components/dashboard/CraftIntegrationPanel.tsx` — UI component
- ✅ `components/dashboard/CraftIntegrationPanel.module.css` — Styling
- ✅ `docs/CRAFT_INTEGRATION.md` — Full documentation

### Modified Files
- ✅ `db/schema.ts` — Added `craftIntegrations` table

### Configuration Files
- ✅ `.env.craft.example` — Environment variables template

## What Happens Next?

After setup, community admins can:

1. **Connect their Craft workspace** via OAuth
2. **Auto-sync documents** — New documents automatically send to Craft
3. **Manual sync** — Sync all existing documents with one click
4. **Edit sync settings** — Toggle auto-sync on/off
5. **Disconnect** — Revoke access anytime

Documents appear in Craft with:
- Original filename as title
- Category as header
- Link back to original document in KithGrid

## Troubleshooting

**"No Craft spaces available" error?**
→ User needs at least one space in their Craft account

**"Redirect URI mismatch" error?**
→ Check `CRAFT_REDIRECT_URI` matches exactly in Craft settings

**Token refresh failing?**
→ Check refresh token is being stored in database

**Auto-sync not working?**
→ Verify `autoSyncDocuments` is true in database
→ Check browser console for errors

## Next Steps

🚀 Other integrations you could add:
- Slack notifications when documents upload
- Google Drive backup
- Calendly integration for events
- Zapier/Make.com webhooks
- Custom document templates

📚 Documentation:
- See [CRAFT_INTEGRATION.md](./CRAFT_INTEGRATION.md) for full API reference
- Check [utils/integrations/craft.ts](../utils/integrations/craft.ts) for available functions
