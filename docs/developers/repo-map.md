---
title: Repo map
sidebar_position: 2
description: "Folder-by-folder map of dryvhub-api, dryvhub-dealer, and dryvhub-marketplace, plus a \"where do I look for X\" cheat sheet."
---

# Repo map

**What this page covers:** what lives in each folder of the three repos, and a quick "where do I look for X?" table. All three repos sit side by side in one parent folder (for example `DryvHub/dryvhub-api`, `DryvHub/dryvhub-dealer`, `DryvHub/dryvhub-marketplace`).

:::tip[In plain English]
Think of the API as a restaurant kitchen (rules, ingredients, recipes) and the two Next.js apps as dining rooms. The kitchen is organized by *what each station does* (controllers take orders, use-cases cook, services fetch from the pantry). The dining rooms are organized by *what a customer sees* (pages, components) with a thin hallway (`services/`, `hooks/`) to the kitchen.
:::

## `dryvhub-api` (NestJS)

| Path | Responsibility |
| ---- | -------------- |
| `src/main.ts` | Bootstrap: CORS (from `CORS_ORIGINS`), URI versioning (`/api/v1`), global `ValidationPipe`, Swagger at `/swagger`, `trust proxy` |
| `src/app.module.ts` | Composition root: registers controllers, use-cases, the global `AuthGuard` and `TenantContextInterceptor`, and binds ports to implementations |
| `src/core/entities/` | Domain shapes as plain TypeScript interfaces (no Nest, no Prisma) |
| `src/core/interfaces/` | Ports: contracts like `TenantUserDataService`, `VehicleDataService`, `StorageService` |
| `src/core/auth/` | `AuthGuard`, `PlatformAdminGuard`, decorators `@Public()`, `@SkipTenantContext()`, `@PlatformAdmin()` |
| `src/core/policies/` | Pure policies, for example dealer access by verification stage and plan |
| `src/core/errors/`, `src/core/http/`, `src/core/plate/`, `src/core/tenant/` | Domain errors, CORS origin parsing and client IP helpers, plate normalization and search helpers, subdomain slug and storage helpers |
| `src/use-cases/<domain>/` | One class per operation (`create-vehicle.use-case.ts`). Business rules live here |
| `src/controllers/<domain>/` | HTTP routes; DTOs in `dtos/` (request validation with `class-validator`, response mappers like `fromEntity`) |
| `src/services/data-services/` | Prisma-backed implementations of the data ports (`PrismaService`, `*.data-service.ts`) |
| `src/services/auth/` | Supabase JWT verification via JWKS (`auth-token-verifier.ts`), Supabase Admin client wrapper |
| `src/services/context-storage/` | `AsyncLocalStorage` that carries the tenant id through a request |
| `src/services/storage/` | S3 presigned URL and object operations |
| `src/services/facebook/`, `src/services/listing/` | Facebook OAuth, page tokens, listing publishers (Facebook and marketplace sync) |
| `src/services/plate-check/` | MongoDB plate-check registry and CSV/XLSX import parser |
| `src/services/rate-limit/`, `src/services/notification-services/` | In-memory inquiry rate limiter; SSE notification stream |
| `src/interceptors/` | `tenant-context.interceptor.ts` |
| `src/decorators/`, `src/types/` | Swagger/validation helpers; `request.user` type augmentation |
| `src/generated/prisma/` | **Generated** Prisma client. Gitignored. Never edit by hand; run `npx prisma generate` |
| `prisma/schema.prisma` | Source of truth for the database schema |
| `prisma/migrations/` | Migration folders created by `prisma migrate dev` (never hand-written) |
| `prisma.config.ts` | Prisma CLI config; migrations use `DIRECT_URL` when set, otherwise `DATABASE_URL` |
| `docs/adr/` | Architecture Decision Records 0001 to 0015 |
| `docs/api/` | Endpoint-family docs (`vehicle-documents.md`, `plate-check.md`) |
| `docs/plans/` | One plan per feature (the contract for the plan-code-review cycle) |
| `docs/Git FLow/` | Branching and release process |
| `.cursor/`, `.codex/` | AI workflow: rules, agents, commands/prompts, skills, hooks |
| `docker-compose.yml` | Local PostgreSQL 15 on port 5432 |
| `AGENTS.md`, `SETUP.md`, `ARCHITECTURE.md`, `README.md` | Contributor contract, long setup guide, architecture notes, overview |

Controllers present today (folder names under `src/controllers/`): `admin-cashback`, `auth`, `cashback`, `dealer`, `dealer-cashback`, `financials`, `inquiries`, `marketplace`, `notifications`, `plate`, `platform-settings`, `reports`, `tenant`, `tenant-document`, `tenant-user`, `tenant-verification`, `vehicle`, `vehicle-document-type`.

Spec files sit next to the code they test (`*.spec.ts`).

## `dryvhub-dealer` (Next.js)

| Path | Responsibility |
| ---- | -------------- |
| `app/layout.tsx` | Root layout: fonts and `html`/`body` only. No Auth or Query providers |
| `app/(public)/` | Public RSC pages with no session providers: `legal/privacy`, `legal/terms`, `dealers/[slug]` |
| `app/(session)/` | Everything that needs a session: login, signup, OTP verify, handoff, tenant landing, onboarding, dashboard, admin. Layout mounts `QueryProvider` and `AuthProvider` |
| `app/(session)/dashboard/` | Authenticated workspace (`inventory`, `listings`, `financials`, `reports`, `inquiries`, `cashback`, `platecheck`, `storage`, `verification`, `billing`, `dealer-profile`, `settings`, `onboarding`) |
| `app/(session)/admin/` | Platform-admin portal (`login`, tenants, vehicles) |
| `app/api/` | Thin Route Handlers: `auth/signup/send-otp`, `auth/signup/verify-otp`, `vehicle-images/upload` |
| `proxy.ts` | Tenant-host rewrite (Next.js 16 name for middleware). Routes by host only; no auth |
| `components/` | Feature UI by domain, `providers/`, shadcn primitives in `ui/` |
| `config/api-client.ts` | The only HTTP driver: base URL, Bearer header, error mapping (`ApiHttpError`) |
| `config/query-client.ts` | `createQueryClient()` defaults |
| `contexts/` | `AuthContext` (Supabase session), `SignupDraftContext` |
| `guards/` | `require-auth`, `require-onboarding`, `require-platform-admin`, `redirect-authed`, `session-loading-shell` |
| `hooks/<domain>/` | TanStack Query hooks (`useFetchVehicles`, `useCurrentTenantMembership`, ...) |
| `services/*.service.ts` | One adapter per API resource (`vehicle.service.ts`, `tenant.service.ts`, ...) with colocated tests |
| `lib/<domain>/` | Pure helpers: tenant host and handoff logic, OTP crypto, SEO, formatting, report shaping |
| `types/api/` | Response and payload interfaces mirroring the API |
| `e2e/` | Playwright: `flows/` (specs), `pages/` (page objects), `helpers/` (mock API, mock auth), `fixtures/` |
| `docs/adr/`, `docs/plans/` | Four ADRs; one plan per feature |
| `.cursor/`, `.codex/`, `.claude/docs/` | AI workflow and design-token reference |

## `dryvhub-marketplace` (Next.js)

| Path | Responsibility |
| ---- | -------------- |
| `app/page.tsx` | Home: hero search, categories, featured listings, buy guide |
| `app/vehicles/page.tsx`, `app/vehicles/[id]/page.tsx` | Inventory browse (RSC seed plus client refetch) and vehicle details |
| `app/purchases/cashback/page.tsx` | Buyer cashback claim and evidence |
| `app/for-dealers/page.tsx` | Dealer-facing landing page |
| `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` | SEO and PWA metadata |
| `components/marketplace/` | `home/`, `inventory/`, `details/`, `cashback/`, `dealers/`, `palette/`, inquiry button and modal |
| `components/providers/` | `QueryProvider`, `ThemeProvider`, `ColorPaletteProvider` |
| `components/ui/` | shadcn primitives |
| `config/api-client.ts` | Unauthenticated HTTP driver (`apiGet`, `apiPost`, `apiPatch`) |
| `hooks/marketplace/` | `useMarketplaceListings`, `useSendInquiry`, `useCashbackClaimPage` |
| `services/` | `marketplace-listings`, `marketplace-inquiries`, `cashback-claims` adapters (zod-parsed) |
| `lib/marketplace/` | Pure helpers: listing display, filters, query mapping, SEO builders, site URL, theme and palettes, cashback copy |
| `types/api/` | Public DTO interfaces |
| `next.config.ts` | `/api/:path*` rewrite to the API origin; Turbopack root pinned |

## Where do I look for X?

| I want to... | Look here |
| ------------ | --------- |
| Add or change an HTTP endpoint | `dryvhub-api/src/controllers/<domain>/` + `src/use-cases/<domain>/` |
| Change a business rule (for example cashback eligibility) | `dryvhub-api/src/use-cases/` and `src/core/policies/` |
| Change the database schema | `dryvhub-api/prisma/schema.prisma`, then migrate and generate (see [Local setup](/docs/developers/local-setup)) |
| See which tenant a request belongs to | `dryvhub-api/src/interceptors/tenant-context.interceptor.ts` |
| Understand JWT verification | `dryvhub-api/src/services/auth/auth-token-verifier.ts` |
| Add a Prisma query | `dryvhub-api/src/services/data-services/*.data-service.ts` (always scope by tenant) |
| Change what the dealer dashboard fetches | `dryvhub-dealer/services/*.service.ts` and `hooks/<domain>/` |
| Change login, signup, or OTP | `dryvhub-dealer/contexts/AuthContext.tsx`, `lib/auth/`, `app/api/auth/signup/` |
| Change tenant subdomain routing | `dryvhub-dealer/proxy.ts`, `lib/tenant/proxy-routing.ts` |
| Add a dealer page | `dryvhub-dealer/app/(session)/dashboard/<route>/page.tsx` (RSC) + a client island in `components/` |
| Add a public buyer page or filter | `dryvhub-marketplace/app/`, `lib/marketplace/inventory-filters.ts`, `listings-query.ts` |
| Change listing SEO or JSON-LD | `dryvhub-marketplace/lib/marketplace/seo.ts` |
| Change theme or palette | `dryvhub-marketplace/lib/marketplace/theme.ts`, `color-palettes.ts`, `app/globals.css` |
| Find the reason behind a decision | `docs/adr/` in the API or dealer repo; see [Decisions](/docs/developers/decisions) |
| Find the plan for a past feature | `docs/plans/<feature>.md` in the relevant repo |
| Change AI rules or commands | `.cursor/` and `.codex/` in each repo; see [AI workflow](/docs/developers/ai-workflow) |

## Related pages

- [Architecture](/docs/developers/architecture)
- [Local setup](/docs/developers/local-setup)
- [Conventions](/docs/developers/conventions)
- [Adding a feature](/docs/developers/adding-a-feature)
