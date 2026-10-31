---
title: Decisions (ADRs)
sidebar_position: 13
description: "A digest of every Architecture Decision Record in dryvhub-api (0001 to 0012) and dryvhub-dealer (0001 to 0004), with context, decision, consequence, and file path."
---

# Decisions (ADRs)

**What this page covers:** a short summary of each Architecture Decision Record (ADR). An ADR is a small document that records *why* the team chose something at a point in time, so nobody has to guess later. Read the original file for alternatives considered and the "revisit when" triggers.

:::tip[In plain English]
If you ever ask "why is it done this way?", the answer is probably here. Each entry reads: **Context** (the problem), **Decision** (what we chose), **Consequence** (what that costs and buys us). Paths are relative to the parent folder that holds the repos.
:::

Not every ADR is equally final: API ADR-0011 is **Proposed** (billing), the others are **Accepted**. Where the code has moved past an ADR, a note says so.

## API ADRs (`dryvhub-api/docs/adr/`)

### ADR-0001: Clean Architecture with ports and adapters

- **Context:** A multi-tenant backend expected to grow; we want vendor portability and to avoid business logic tangled into controllers and Prisma calls.
- **Decision:** Layers `core/entities`, `core/interfaces` (ports), `use-cases`, `controllers`, `services` (adapters), plus interceptors. Dependencies point strictly inward; rules are enforced in `AGENTS.md` section 4.
- **Consequence:** Infrastructure is swappable and use-cases are testable without Nest or a database, at the cost of more ceremony (tokens, interfaces, adapters) and the discipline to keep Prisma types out of use-cases.
- **File:** `dryvhub-api/docs/adr/0001-clean-architecture-adoption.md`

### ADR-0002: Supabase as auth provider only

- **Context:** Supabase bundles auth, Postgres, PostgREST, realtime, storage, and edge functions. Adopting all of it is fast but locks the API shape and security model to one vendor.
- **Decision:** Use Supabase for managed Postgres and JWT issuance only. Do not use PostgREST, `auth.uid()` row-level security, Realtime, Edge Functions, or Supabase Storage.
- **Consequence:** Cheap start and a possible migration by swapping `DATABASE_URL` and one adapter; in return we build realtime (SSE) and tenant isolation ourselves.
- **File:** `dryvhub-api/docs/adr/0002-supabase-as-auth-provider-only.md`

### ADR-0003: Tenant context via a Nest interceptor

- **Context:** Every authenticated request needs a tenant id that downstream code can read without passing it everywhere. Header-based ids can be spoofed; middleware runs before the token is validated.
- **Decision:** A global `TenantContextInterceptor` reads `request.user`, looks up the active `tenant_users` row, and runs the handler inside `AsyncLocalStorage`. `@Public()` and `@SkipTenantContext()` bypass it.
- **Consequence:** Tenant identity never comes from user input, and deactivated users are locked out automatically. Cost: one indexed DB lookup per request, and public routes cannot read the tenant (the SSE stream is a known edge case).
- **File:** `dryvhub-api/docs/adr/0003-tenant-context-via-interceptor.md`

### ADR-0004: Verify Supabase JWTs locally via JWKS

- **Context:** Calling Supabase to verify each token added 50 to 200 ms and a runtime dependency on their auth service.
- **Decision:** Verify tokens locally with `jose` against the project's JWKS (`createRemoteJWKSet`), checking issuer and the `authenticated` audience; fail fast if `SUPABASE_URL` is unset.
- **Consequence:** No network call per request after the first key fetch. Tokens stay valid until they expire even if the Supabase user is removed; the `tenant_users.isActive` check covers immediate lockout.
- **File:** `dryvhub-api/docs/adr/0004-local-jwt-verification-via-jwks.md`

### ADR-0005: Manual `WHERE tenantId` filtering

- **Context:** Tenant isolation options were manual filtering, a Prisma `$extends` client extension, or Postgres row-level security.
- **Decision:** Every tenant-scoped data-service method filters by `tenantId` read from `ContextStorageService`. Every tenant table has `tenantId` and composite indexes.
- **Consequence:** Zero setup, transparent, and easy to unit-test, but a forgotten filter is a silent leak. Revisit when nested includes appear or other consumers touch the database directly.
- **File:** `dryvhub-api/docs/adr/0005-manual-tenantid-filtering.md`

### ADR-0006: `Decimal` for money in domain entities

- **Context:** JavaScript numbers lose precision for money, and Prisma returns `Decimal` at runtime, which had been hidden by casts.
- **Decision:** Money and precise numeric fields use `Decimal` from `decimal.js` in entities. Use-cases build `new Decimal(input.price)`; responses serialize with `String(value)`.
- **Consequence:** Types match runtime and precision survives end to end. `core/` gains a library dependency, arithmetic uses methods, and JSON money is a string.
- **File:** `dryvhub-api/docs/adr/0006-decimal-for-money-fields.md`

### ADR-0007: `decimal.js` as a direct dependency

- **Context:** `Decimal` must be imported from somewhere. Importing from Prisma would put Prisma inside the framework-free core.
- **Decision:** Declare `decimal.js` directly in `package.json` and import `Decimal from 'decimal.js'` in the domain layer; never from `@prisma/client`.
- **Consequence:** The core stays free of Prisma imports and the version is pinned independently, at the cost of one `package.json` line (no bundle impact).
- **File:** `dryvhub-api/docs/adr/0007-decimal-js-direct-dependency.md`

### ADR-0008: Client-initiated self-service registration

- **Context:** New dealers must get a tenant. Options were Supabase webhooks, client-initiated, lazy provisioning, or invitations.
- **Decision:** The frontend signs up with Supabase, then calls `POST /api/v1/auth/register` with the token and business details. The use-case checks idempotency, derives the subdomain, and creates tenant plus owner atomically.
- **Consequence:** No webhook infrastructure, synchronous errors, and no half-registered tenants. Orphan Supabase users are possible if the client crashes between steps, and subdomain collisions return 409. Note: the ADR says the first user is `super_admin`; the code now creates an `owner` and also requires a confirmed email.
- **File:** `dryvhub-api/docs/adr/0008-client-initiated-registration.md`

### ADR-0009: Tenant subdomain routing and validation boundary

- **Context:** Frontends use subdomains for UX, but the backend must not trust hostnames for access.
- **Decision:** Host or subdomain is used only for public tenant lookup (`GET /tenants/by-subdomain/:subdomain`, validated by `ParseSubdomainPipe`). Protected tenant context comes only from authenticated membership.
- **Consequence:** Two resolution paths to maintain (public lookup for UX, membership for data). Invalid format returns `400 INVALID_SUBDOMAIN`; unknown returns 404.
- **File:** `dryvhub-api/docs/adr/0009-tenant-subdomain-architecture.md`

### ADR-0010: Private S3 direct uploads for vehicle images

- **Context:** Image bytes should not pass through the API, and the bucket must stay private (documents will follow).
- **Decision:** The API issues short-lived presigned `PUT` URLs from metadata-only requests, tracks upload status in Postgres, and verifies on `complete`. Object keys are server-generated and tenant-scoped.
- **Consequence:** No bytes through the API and objects stay private, but clients do a two-step upload and Swagger cannot show a file picker. The same pattern backs vehicle documents.
- **File:** `dryvhub-api/docs/adr/0010-private-s3-direct-vehicle-image-uploads.md`

### ADR-0011: SaaS billing with PayMongo (**Proposed**)

- **Context:** Subscription billing is needed for dealerships in the Philippines. The first draft chose Maya, which has no subscription engine and would have required a DryvHub-built charge scheduler. The provider changed to PayMongo in November 2026; its Subscriptions API creates invoices, charges the vaulted payment method, and retries automatically.
- **Decision:** PayMongo runs recurring invoicing, charging, retries, and card vaulting (cards and Maya as payment methods). DryvHub owns trials, grace period and suspension, cancel-at-period-end, tenant entitlements, and a webhook-fed mirror of subscription state. DryvHub never stores raw card data and builds no charge scheduler.
- **Consequence:** Much less to build and operate, but billing is coupled to PayMongo, subscriptions accept only cards and Maya, retries are fixed at three daily attempts, and PayMongo must enable Subscriptions and card vaulting on our account. A disabled webhook would silently stop updates, so reconciliation is required. Status is Proposed, so treat billing as **Planned**, not shipped.
- **File:** `dryvhub-api/docs/adr/0011-SaaS-Billing-Using-PayMongo.md`

### ADR-0012: MongoDB for the plate-check registry

- **Context:** Plate flags are intentionally shared across all dealers (a cross-tenant read) and have search and bulk-import patterns unlike tenant inventory.
- **Decision:** Store flags and usage counters in MongoDB Atlas with the official driver, behind a `PlateFlagDataService` port. Postgres stays the system of record for tenants, users, and vehicles.
- **Consequence:** Clean separation from tenant-scoped models, but a second database to operate and routes that depend on `MONGODB_URI`. Evidence images use a server-side S3 put, an exception to the presigned-only rule.
- **File:** `dryvhub-api/docs/adr/0012-mongodb-plate-check-registry.md`

## Dealer ADRs (`dryvhub-dealer/docs/adr/`)

### ADR-0001: Stateless short-lived signup OTP

- **Context:** Signup must prove email ownership with a branded, short-lived 6-digit code, without new database tables, while keeping Supabase as identity provider.
- **Decision:** Next.js Route Handlers generate and email the code (Resend) and store the challenge in a signed httpOnly `otp_challenge` cookie (HS256 JWT with a hashed code, attempts, and expiry). On success the service-role Admin API confirms the email.
- **Consequence:** No migrations and simple ops. The challenge is bound to one browser, in-memory rate limits are per instance, and Supabase email-confirmation policy must be kept aligned with this path.
- **File:** `dryvhub-dealer/docs/adr/0001-stateless-short-lived-signup-otp.md`

### ADR-0002: Multi-tenant login with origin-scoped bearer tokens

- **Context:** Workspaces live on `slug.root` hosts, but the session is Supabase bearer tokens in browser localStorage (origin-scoped), and cross-subdomain cookies were rejected.
- **Decision:** `proxy.ts` routes by host only. Login runs on the same origin; the API authorizes by bearer token plus membership, never by hostname.
- **Consequence:** One login implementation and no cookie refresh in the edge proxy. No single sign-on across subdomains: each tenant origin holds its own session, and a bare redirect to another host drops it (see ADR-0003).
- **File:** `dryvhub-dealer/docs/adr/0002-multi-tenant-bearer-login.md`

### ADR-0003: Post-login redirect with hash session hand-off

- **Context:** Product wants the address bar to show the tenant host after login, but localStorage does not cross origins and tokens in query strings leak to servers and logs.
- **Decision:** Resolve the subdomain from the API, then navigate to `slug.root/auth/handoff?next=...` carrying `access_token` and `refresh_token` in the URL **hash**. The destination calls `setSession`, strips the hash, and sanitizes `next`.
- **Consequence:** The desired URL experience with no cookies, at the cost of a one-time token relay that must stay hash-only and behind `sanitizeInternalNextPath`.
- **File:** `dryvhub-dealer/docs/adr/0003-post-login-tenant-host-handoff.md`

### ADR-0004: Facebook Page connect and listing sync

- **Context:** Dealers want published vehicles posted to their Facebook Page. The API already provides tenant-level OAuth connect and listing-level sync.
- **Decision:** A two-phase model: connect a Page once per tenant (OAuth, then select a Page), then sync per listing (requires a published listing and a connected tenant). Tokens never leave the API.
- **Consequence:** Clear separation of connect and sync, with secrets server-side. Dealers need the connect UI and the pending-page cache expires after about 10 minutes. A re-sync creates a new post, and Meta app review is an operational prerequisite.
- **File:** `dryvhub-dealer/docs/adr/0004-facebook-page-connect-listing-sync.md`

## Related pages

- [Architecture](/docs/developers/architecture)
- [Auth and tenancy](/docs/developers/auth-and-tenancy)
- [Data model](/docs/developers/data-model)
- [Adding a feature](/docs/developers/adding-a-feature)
