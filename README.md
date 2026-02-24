# Launchpad

> An idea validation platform — share, discover, and validate startup concepts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 3 |
| Backend | Express 4, TypeScript, Node.js 20+ |
| Database | PostgreSQL (via Drizzle ORM) |
| Auth | better-auth (email/password) |
| Validation | Valibot |
| Server State | TanStack Query v5 |
| Forms | TanStack Form |
| Monorepo | pnpm Workspaces |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (port 3000)                  │
│              Next.js 15 — App Router (SSR/CSR)           │
│   TanStack Query  │  TanStack Form  │  better-auth/react │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (credentials: include)
┌──────────────────────────▼──────────────────────────────┐
│                   Express API (port 3001)                 │
│   /api/auth/*  │  /api/ideas  │  /api/categories  │ docs │
│         better-auth  │  Drizzle ORM                      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                     PostgreSQL                            │
│  users │ sessions │ ideas │ votes │ comments │ categories │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and secrets

# 3. Push schema to database
cd apps/api && pnpm db:push

# 4. Seed the database
pnpm db:seed

# 5. Run development servers (in parallel)
cd ../..
pnpm dev
```

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/api/docs |
| Health Check | http://localhost:3001/health |
| DB Studio | `cd apps/api && pnpm db:studio` |

## Project Structure

```
lp-test/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   └── src/
│   │       ├── app/            # App Router pages
│   │       │   ├── (auth)/     # Login, Register
│   │       │   └── (app)/      # Main app pages
│   │       ├── components/     # UI, layout, ideas, modals
│   │       ├── hooks/          # TanStack Query hooks
│   │       ├── lib/            # API client, auth, utils
│   │       └── providers/      # QueryProvider
│   └── api/                    # Express backend
│       └── src/
│           ├── db/             # Drizzle schema, seed
│           ├── lib/            # better-auth setup
│           ├── middleware/     # Auth, validate, error
│           ├── routes/         # ideas, categories, comments
│           └── docs/           # OpenAPI YAML
└── packages/
    └── shared/                 # Types, schemas, constants
        └── src/
            ├── types/
            ├── schemas/        # Valibot validators
            └── constants/
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) | — |
| `BETTER_AUTH_URL` | Auth server URL | `http://localhost:3001` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `PORT` | API server port | `3001` |
| `NEXT_PUBLIC_API_URL` | API base URL (frontend) | `http://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | App URL (frontend) | `http://localhost:3000` |

## Deployment

- **Frontend**: Deploy `apps/web` to Vercel. Set `NEXT_PUBLIC_API_URL` to your API domain.
- **Backend**: Deploy `apps/api` to Railway, Render, or any Node.js host. Set all backend env vars.
- **Database**: Use Neon, Supabase, or self-hosted PostgreSQL. Run `pnpm db:migrate` on deploy.

## Development

```bash
# Run all apps
pnpm dev

# Build everything
pnpm build

# Type check all packages
pnpm typecheck

# Database operations (from apps/api)
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema (dev)
pnpm db:seed       # Seed data
pnpm db:studio     # Open Drizzle Studio
```