# Architecture Decision Records

## ADR-001: pnpm Workspaces Monorepo

**Status**: Accepted

**Context**: The platform has a frontend, backend, and shared code that benefits from being co-located.

**Decision**: Use pnpm Workspaces as the monorepo tool.

**Rationale**:
- Native to pnpm with zero additional tooling (no Turborepo/Nx required)
- `workspace:*` protocol for cross-package dependencies
- Efficient shared `node_modules` hoisting
- Simple `pnpm --filter` for targeted scripts

**Consequences**: All packages share a root `node_modules`. Requires pnpm 9+.

---

## ADR-002: Drizzle ORM over Prisma

**Status**: Accepted

**Context**: Need a TypeScript ORM for PostgreSQL access in the Express backend.

**Decision**: Use Drizzle ORM.

**Rationale**:
- SQL-first: schema defined as TypeScript, queries are type-safe SQL
- No separate binary/codegen step at runtime
- Excellent DX with drizzle-kit for migrations
- Lightweight and tree-shakeable
- Better performance than Prisma for simple queries

**Consequences**: More verbose queries than Prisma. Team must be comfortable with SQL-like syntax.

---

## ADR-003: better-auth over NextAuth

**Status**: Accepted

**Context**: Authentication is needed across a separate Next.js frontend and Express backend.

**Decision**: Use better-auth hosted on the Express API.

**Rationale**:
- Framework-agnostic: works with any backend, not tied to Next.js
- First-class Drizzle adapter
- Handles sessions, cookies, and CSRF out of the box
- Email/password + social OAuth ready
- Single auth server shared by all frontends

**Consequences**: Auth requests go to `NEXT_PUBLIC_API_URL/api/auth/*`. CORS and cookie settings must be configured correctly.

---

## ADR-004: TanStack Query for Server State

**Status**: Accepted

**Context**: The frontend needs to fetch, cache, and synchronize server data.

**Decision**: Use TanStack Query v5.

**Rationale**:
- Industry-standard for React server state management
- Automatic cache invalidation and background refetching
- Built-in loading/error states
- Supports optimistic updates (used for vote toggle)
- Avoids prop-drilling and context misuse for server data

**Consequences**: Requires `QueryClientProvider` at the root. All data fetching goes through query hooks.

---

## ADR-005: TanStack Form + Valibot

**Status**: Accepted

**Context**: Forms need validation on both client (UX) and server (security).

**Decision**: TanStack Form for form state, Valibot for schema validation, shared schemas in `@lp/shared`.

**Rationale**:
- Valibot has a modular, tree-shakeable design (smaller bundle than Zod)
- Schemas defined once in `packages/shared` and used on both frontend and backend
- TanStack Form provides field-level validation and submission state
- `v.safeParse` on the API side provides defense-in-depth

**Consequences**: Valibot API differs from Zod. Team must learn `v.pipe`, `v.object`, etc.

---

## ADR-006: Vote Count Denormalization

**Status**: Accepted

**Context**: Displaying vote counts on every idea card requires efficient reads.

**Decision**: Store `voteCount` and `commentCount` as integer columns on the `ideas` table, updated atomically with SQL `+1` / `-1`.

**Rationale**:
- Avoids `COUNT(*)` join on every list query
- Atomic `UPDATE ideas SET vote_count = vote_count + 1` prevents race conditions
- Acceptable inconsistency risk: counts could drift if bugs occur, but can be reconciled

**Consequences**: Two writes per vote action (insert + update). Counts must be kept in sync via application logic.

---

## ADR-007: Trending Score Algorithm

**Status**: Accepted

**Context**: A "trending" feed needs to surface popular recent ideas.

**Decision**: Score = `voteCount + commentCount * 0.5`, filtered by time period (today/week/month/all).

**Rationale**:
- Simple, explainable formula
- Comments weighted at 0.5× to prevent comment-spamming gaming
- Time period filtering keeps content fresh
- Computed inline in SQL, no separate job needed

**Consequences**: Score is not persisted, computed on every query. If performance degrades, add a materialized `trending_score` column updated by a cron job.

---

## ADR-008: Component Strategy (No shadcn/ui)

**Status**: Accepted

**Context**: The design requires a specific visual style matching the Figma spec (indigo primary, specific card layouts).

**Decision**: Build UI components from scratch using Tailwind CSS + CVA (class-variance-authority), without importing shadcn/ui components.

**Rationale**:
- Full control over styling without overriding defaults
- Exact Figma match: indigo `#6366f1` primary, specific vote box layout, card structure
- No Radix UI primitives dependency (keeps bundle smaller for simple components)
- CVA provides type-safe variant management matching shadcn patterns

**Consequences**: More initial code than using shadcn. Accessibility features (ARIA, keyboard nav) must be added manually where needed.
