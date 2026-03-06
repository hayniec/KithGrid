# Deployment & Environment Guide

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20.x |
| Framework | Next.js | 16.1.6 |
| Language | TypeScript | 5.x |
| UI | React | 19.2.3 |
| ORM | Drizzle | 0.45.1 |
| Database | PostgreSQL | 15+ (via Neon or Supabase) |
| Auth | Supabase Auth | Latest |
| Email | Resend | Latest |
| Mobile | React Native (Expo) + Capacitor | — |

---

## Environment Variables

### Required (`.env.local`)

```bash
# Database — Neon or Supabase Postgres connection string
DATABASE_URL=postgresql://user:password@host:5432/kithgrid

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Email (Resend)
RESEND_API_KEY=re_...your-resend-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional

```bash
# Stripe (for billing — Priority 5)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Super Admin
SUPER_ADMIN_EMAILS=admin@kithgrid.com,you@example.com

# Logging
SENTRY_DSN=https://...
```

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/hayniec/KithGrid.git
cd KithGrid
npm install
```

### 2. Database Setup

**Option A: Supabase (Recommended)**
1. Create a project at supabase.com
2. Copy the connection string from Settings > Database
3. Set `DATABASE_URL` in `.env.local`
4. Copy Supabase URL and anon key from Settings > API

**Option B: Neon**
1. Create a project at neon.tech
2. Copy the connection string
3. Set `DATABASE_URL` in `.env.local`
4. You still need Supabase for auth — create a Supabase project and point it at your Neon DB

### 3. Run Migrations

```bash
npx drizzle-kit push
```

This applies the schema from `db/schema.ts` to your database.

### 4. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Database Schema Management

### Drizzle ORM Config

File: `drizzle.config.ts`

```typescript
export default {
    schema: './db/schema.ts',
    out: './db/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
};
```

### Commands

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit push

# Open Drizzle Studio (visual DB browser)
npx drizzle-kit studio
```

---

## Deployment Options

### Vercel (Recommended for Next.js)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vercel auto-detects Next.js

```bash
# Or deploy via CLI
npx vercel --prod
```

### Netlify

Already configured with `netlify.toml` (if present) or via Netlify dashboard.

1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set environment variables

### Docker

```bash
# Build
docker build -t kithgrid .

# Run
docker run -p 3000:3000 --env-file .env.local kithgrid
```

### Railway

1. Connect GitHub repo to Railway
2. Railway auto-detects Next.js
3. Add PostgreSQL plugin for database
4. Set remaining environment variables

---

## Multi-Tenant Deployment Considerations

### Single Instance (Recommended for MVP)

All communities share one deployment and one database. Tenant isolation is enforced at the application layer via `communityId` filtering.

**Pros:** Simple, cost-effective, easy to maintain
**Cons:** Noisy neighbor risk (one community's heavy usage affects others)

### Database-Per-Tenant (Future / Enterprise)

Each community gets its own database schema or database instance.

**Pros:** Complete isolation, easier compliance, per-tenant backup/restore
**Cons:** Complex deployment, higher cost, migration management

**When to consider:** When you have paying enterprise customers with data residency requirements.

---

## Supabase Auth Configuration

### Required Setup in Supabase Dashboard

1. **Authentication > Providers**
   - Enable Email (already done)
   - Enable Google OAuth (add client ID/secret)
   - Enable Facebook OAuth (optional)
   - Enable Apple OAuth (optional)

2. **Authentication > URL Configuration**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/select-community`

3. **Authentication > Email Templates**
   - Customize confirmation email
   - Customize password reset email

---

## Monitoring & Observability

### Recommended Stack

| Concern | Tool | Notes |
|---------|------|-------|
| Error tracking | Sentry | Catch and alert on runtime errors |
| Performance | Vercel Analytics | Built-in if using Vercel |
| Uptime | Better Uptime / UptimeRobot | Ping monitoring |
| Logs | Vercel Logs / Railway Logs | Platform-provided |
| Database | Supabase Dashboard | Query performance, connection pooling |

### Key Metrics to Track

- **Per-tenant:** Active users, member count, feature usage
- **Platform:** Total communities, total users, API response times
- **Errors:** Failed auth attempts, data isolation violations, server action errors

---

## CI/CD Pipeline (Recommended)

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test  # when tests exist
```

---

## Security Checklist for Production

- [ ] Remove mock/bypass user from UserContext (or gate behind NODE_ENV)
- [ ] Set strong Supabase JWT secret
- [ ] Enable RLS policies on all tables
- [ ] Configure CORS for your domain only
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Enable Supabase email verification
- [ ] Add rate limiting to server actions
- [ ] Audit all `console.log` statements (remove sensitive data logging)
- [ ] Set up Sentry or similar error tracking
- [ ] Configure CSP headers in `next.config.js`
- [ ] Enable HTTPS (automatic on Vercel/Netlify/Railway)
