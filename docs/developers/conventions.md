---
title: Conventions
sidebar_position: 14
description: "Condensed coding conventions for TypeScript, errors, naming, NestJS API code, Next.js frontends, Prisma, security, and communication, distilled from the repos' rules and AGENTS files."
---

# Conventions

**What this page covers:** the day-to-day coding rules across the three repos, condensed from each repo's `AGENTS.md` and `.cursor/rules`. When this page and a repo's own rules disagree, the repo's rule files win; check them for edge cases.

:::tip[In plain English]
Conventions are the team's shared habits: where code goes, what names look like, how errors are handled, and the safety rules we never bend (especially around tenant data and secrets). Following them makes code easy for the next person, human or AI, to read and review.
:::

## Everywhere (all repos)

### Types

- Prefer explicit types; use `unknown` when a type is truly unknown, then narrow with a type guard.
- Avoid `any` and avoid `as` assertions unless truly necessary.
- `strict` TypeScript with `strictNullChecks`: handle `null` and `undefined` explicitly.
- Use `interface` for object shapes, `type` for unions and mapped types. Use `import type` for type-only imports.
- Type parameters and return values of public functions.

### Errors

- Never swallow errors with an empty `catch`.
- Log with context (operation name, input summary) before rethrowing. **No secrets, tokens, or PII in logs.**
- Use framework exceptions at the transport edge (Nest HTTP exceptions; `ApiHttpError` in frontends).

### Functions and structure

- One concern per function; extract when it grows past about 30 lines.
- Prefer pure functions; push side effects to boundaries (services, controllers, Route Handlers, providers).
- Use early returns and guard clauses.
- Code reads top-down: public entry points first, helpers below.
- Prefer small, single-purpose units that are easy to test (inject dependencies, keep functions pure).

### Naming

| Kind | Style | Example |
| ---- | ----- | ------- |
| Variables and functions | camelCase, verb-first for functions | `fetchUser`, `validateInput` |
| Classes, DTOs, components, types | PascalCase | `CreateVehicleDto` |
| Booleans | `is`, `has`, `can` prefix | `isLoading`, `hasError`, `canEdit` |
| Abbreviations | Only common ones | `id`, `url`, `err`, `req`, `res` |
| Constants | Named; no magic numbers or strings | `OTP_EXPIRY_SECONDS` |

### General

- `const` over `let`; never `var`.
- Comment *why*, not *what*.
- Config comes from environment variables; **never hard-code secrets**. Local `.env` files are for dev only and are never committed.
- Timestamps and APIs are UTC.
- npm is the only package manager.
- Smallest diff that does the job. Do not refactor unrelated modules in a feature PR.
- Keep backward compatibility unless a plan authorizes a breaking change.

## `dryvhub-api` (NestJS)

### Layering (reject violations)

| Layer | May import | Must not import |
| ----- | ---------- | --------------- |
| `core/entities` | nothing | any layer |
| `core/interfaces` | `core/entities` | use-cases, controllers, services, interceptors |
| `use-cases` | `core/*` | controllers, services, interceptors, Prisma, Nest infrastructure |
| `controllers` | use-cases, `core/entities`, local DTOs | infrastructure services |
| `services` | `core/*` plus Prisma, Supabase, AWS SDKs | controllers, use-cases |
| `interceptors` | `core/interfaces` | controllers, use-cases |

### Domain and HTTP

- Core entities are plain TypeScript interfaces: no decorators and no Prisma model types.
- Use string unions instead of enums in the core domain.
- Business logic lives in use-cases. Controllers parse input, call one use-case, and map to a response DTO (for example `fromEntity`).
- DTOs live in `src/controllers/<domain>/dtos/`; input uses `class-validator`, docs use Swagger decorators (`@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiResponse`, `@ApiProperty`).
- `ValidationPipe({ whitelist: true })` is global; use `transform: true` on query DTOs and `ParseUUIDPipe` on UUID params.
- Routes are plural nouns under `/api/v1`: `/vehicles`, `/tenant-users`, `/vehicles/:id/images`.
- Use-case `execute()` takes plain input objects or domain types, never HTTP DTOs.
- Money uses `Decimal` (`decimal.js`); JSON money is a string.

Status codes:

| Code | Use |
| ---- | --- |
| 200 | GET, PUT, PATCH success |
| 201 | POST created |
| 204 | DELETE success |
| 400 | Validation failed |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 404 | Not found (including another tenant's id) |
| 409 | Duplicate or state conflict |
| 500 | Unexpected; log server-side, never leak internals |

### Security and tenancy

- Cross-tenant leakage is the highest-risk bug class.
- Tenant identity comes **only** from the authenticated user through `TenantUserDataService` and `ContextStorageService`. Never accept it from headers, hostnames, query strings, or bodies on authenticated routes.
- Every Prisma read and write is scoped by tenant; never bypass it in a data service.
- Protected routes keep `AuthGuard`; use `@Public()` only where intended.
- Parameterized Prisma queries only; never interpolate SQL.
- Validate every input at the boundary. Do not log secrets, bearer tokens, raw Supabase credentials, or full PII payloads.

### Prisma (CLI only)

- Edit only `prisma/schema.prisma` by hand.
- After any schema change, run `npx prisma migrate dev --name <name>` (if a migration is needed) **and** `npx prisma generate` in the same session.
- Never create or edit `src/generated/prisma/**`, never hand-write `prisma/migrations/**`, never hand-edit `dist/`.
- Apply existing migrations in CI or production with `npm run db:migrate`.

## `dryvhub-dealer` (Next.js 16)

- Layering: `config/api-client.ts` then `services/*.service.ts` then `hooks/*/use*.ts` then `lib/*` (pure) then `app/` and `components/`. No transport in `lib/`, no React Query in `services/`.
- Server Components by default; add `"use client"` only for interactivity, browser APIs, or hooks. New dashboard pages are RSC `page.tsx` files that import a client island.
- Domain CRUD never goes in Route Handlers; they are only for secrets the browser cannot hold (OTP, upload proxy).
- Types for API shapes live in `types/api/`; never invent backend Prisma types.
- Validate forms, Route Handlers, and important service responses with zod.
- Server state with TanStack Query only. No Redux, Zustand, Jotai, or axios.
- UI: shadcn primitives first, Tailwind plus CSS variables, `cn()` helper, lucide icons, `sonner` toasts, components around 100 lines or fewer.
- Accessibility: semantic HTML, every input labeled, keyboard reachable, visible focus; `data-testid` only when role or label is not enough.
- Never put server-only secrets in `NEXT_PUBLIC_*` or client bundles.
- Do not regress the performance rules in [Dealer app internals](/docs/developers/dealer-app-internals).

## `dryvhub-marketplace` (Next.js 16)

- Inward-only layering (presentation, application, infrastructure, domain). `lib/` and `types/` never import outer layers.
- No `fetch` or hard-coded API hosts or paths in components or pages; no buyer auth or Supabase.
- Parse every API response with zod in `services/`.
- Public DTO only: never request or render plate numbers, purchase prices, dealer notes, expenses, internal documents, or private buyer or agent data.
- Never compute eligibility or cashback of record on the client.
- Use existing marketplace CSS classes and tokens; do not add a second primary color or a second UI kit.
- The homepage must still render when the API fails (honest empty states, no fake cars).

## Communication (humans and AI)

- Concise and complete; no filler; open with substance.
- Prefer code references over pasting whole files.
- Plans, reviews, and handoffs follow the structures in [Adding a feature](/docs/developers/adding-a-feature).
- Use explicit, full-language warnings for destructive, irreversible, or security-sensitive actions.
- Review findings use one severity model: **Critical** (must fix before production), **Suggestion**, **Nice to have**.

## Related pages

- [Architecture](/docs/developers/architecture)
- [Auth and tenancy](/docs/developers/auth-and-tenancy)
- [Testing](/docs/developers/testing)
- [AI workflow](/docs/developers/ai-workflow)
