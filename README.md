# KithGrid

Multi-tenant community management platform for HOAs, condos, and neighborhoods. Built with Next.js, Supabase Auth, Drizzle ORM, and PostgreSQL.

## Features

- **Multi-tenancy** — tenant-first architecture with community selection, switching, and cookie-based persistence
- **Forum** — categorized discussion board with comments and likes
- **Events** — community calendar with RSVP tracking
- **Marketplace** — buy/sell/trade listings with 30-day auto-expiry
- **Direct messaging** — private 1-on-1 conversations between members
- **Neighbor directory** — searchable by name, skills, and equipment
- **Community resources** — reservable facilities and shared equipment
- **HOA management** — documents, dues info, board member directory
- **Service providers** — neighbor-recommended local professionals
- **Local guide** — curated nearby restaurants, parks, and amenities
- **Emergency SOS** — one-tap alert system with medical neighbor lookup
- **Admin console** — branding, user management, invitations, billing
- **Super admin panel** — platform-wide tenant management and usage tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Auth | Supabase Auth |
| Database | PostgreSQL (Neon or Supabase) |
| ORM | Drizzle |
| Email | Resend |
| UI | React 19, CSS Modules, Lucide icons |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local  # then fill in your values

# Push schema to database
npx drizzle-kit push

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See the [Deployment & Environment Guide](https://www.craft.do/) in Craft.do for the full list. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `RESEND_API_KEY` — Resend email API key

## Project Structure

```
app/              Next.js App Router pages and server actions
  actions/        Server actions (data layer)
  dashboard/      Authenticated community pages
  super-admin/    Platform admin panel
components/       Reusable UI components
contexts/         React context providers (User, Theme)
db/               Drizzle schema and database connection
docs/             User, admin, and super-admin guides
lib/              Shared utilities (Supabase clients, email)
scripts/          Dev scripts (seed, migration, setup)
types/            TypeScript type definitions
utils/            Auth helpers and role utilities
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Drizzle Studio |

## Documentation

Project documentation lives in [Craft.do](https://www.craft.do/):
- Multi-Tenancy First Architecture
- Tenant Onboarding Flow
- Feature Completion Roadmap
- API & Data Isolation Specification
- Deployment & Environment Guide

Generated user guides are in `docs/`.
