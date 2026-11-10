---
title: Environment variables
sidebar_position: 4
description: "Every environment variable name per repo, with scope (client or server), purpose, and whether it is required. Names only, never values."
---

# Environment variables

**What this page covers:** the environment variables each repo reads, where they are visible (browser or server only), what they do, and whether you must set them. It lists **names and purpose only**. Never paste real values into docs, tickets, or chat.

:::tip[In plain English]
An environment variable is a setting that lives outside the code (in a `.env` file locally, or in the hosting dashboard in production). In Next.js, anything starting with `NEXT_PUBLIC_` is baked into the browser bundle, so it is visible to everyone. Secrets must **never** start with `NEXT_PUBLIC_`.
:::

Sources: `.env.example` in the API and dealer repos, plus a code search for `process.env` in each repo. The marketplace has no `.env.example` on the checked-out branch, so its list comes from the code. Placeholders in examples look like `<your-supabase-url>`.

## `dryvhub-api` (all server-side)

Template: `.env.example`. The API never exposes env values to clients. Values with a default are optional.

### Core

| Variable | Required? | Purpose |
| -------- | --------- | ------- |
| `PORT` | Optional (default `3001`) | HTTP port |
| `CORS_ORIGINS` | Optional (defaults to local dealer and marketplace origins) | Comma-separated browser origins allowed to call the API. Supports `*.localhost`-style host patterns; do not use `*` or `https://*` |
| `DATABASE_URL` | **Required** | PostgreSQL connection string used at runtime (Prisma `pg` adapter) |
| `DIRECT_URL` | Required for hosted Supabase migrations; otherwise optional | Direct Postgres connection used by `prisma migrate` (pooler URLs hang) |
| `SUPABASE_URL` | **Required** (startup fails without it) | Derives the JWT issuer and the JWKS URL for local token verification; also used by the Supabase Admin client |
| `SUPABASE_ANON_KEY` | Not read by API code | Listed in the template for convenience when testing token calls from curl or Postman |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for `POST /auth/register` | Server-only secret for the Admin API (checks that a user's email is confirmed) |

### Storage (S3)

| Variable | Required? | Purpose |
| -------- | --------- | ------- |
| `S3_REGION` | Required for uploads | Must match the bucket's real region, or presigned PUTs fail with a 301 |
| `S3_BUCKET` | Required for uploads | Private bucket name |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Required for uploads | Credentials for presigning and object operations |
| `S3_ENDPOINT`, `S3_FORCE_PATH_STYLE` | Optional | S3-compatible providers or local MinIO |
| `VEHICLE_IMAGE_MAX_BYTES` | Optional (default 10 MB) | Max declared image size |
| `VEHICLE_IMAGE_UPLOAD_URL_EXPIRES_SECONDS`, `VEHICLE_IMAGE_VIEW_URL_EXPIRES_SECONDS` | Optional (300 and 3600) | Presigned URL lifetimes |
| `VEHICLE_DOCUMENT_MAX_BYTES` | Optional (default 15 MB) | Max declared vehicle-document size |
| `VEHICLE_DOCUMENT_UPLOAD_URL_EXPIRES_SECONDS`, `VEHICLE_DOCUMENT_VIEW_URL_EXPIRES_SECONDS` | Optional (300 and 3600) | Presigned URL lifetimes |
| `TENANT_DOCUMENT_UPLOAD_URL_EXPIRES_SECONDS`, `TENANT_DOCUMENT_VIEW_URL_EXPIRES_SECONDS` | Optional (300 and 3600) | Onboarding document URL lifetimes. Size limits are fixed per document type in code |
| `DEALER_PROFILE_UPLOAD_URL_EXPIRES_SECONDS`, `DEALER_PROFILE_VIEW_URL_EXPIRES_SECONDS` | Optional | Logo and cover URL lifetimes |
| `CASHBACK_DEALER_EVIDENCE_UPLOAD_URL_EXPIRES_SECONDS`, `CASHBACK_DEALER_EVIDENCE_VIEW_URL_EXPIRES_SECONDS` | Optional | Dealer cashback evidence URL lifetimes |

### Facebook

| Variable | Required? | Purpose |
| -------- | --------- | ------- |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Required for the `/tenants/current/facebook/connect/*` endpoints | Meta app credentials for Page connect (OAuth) |
| `FACEBOOK_REDIRECT_URI` | Required for connect | Must exactly match a redirect URI allowlisted in the Meta app and the dealer callback route (`/dashboard/settings/facebook/callback`) |
| `FACEBOOK_GRAPH_API_VERSION` | Optional (default `v26.0`) | Graph API version for OAuth, token resolve, and posts |
| `FACEBOOK_OAUTH_STATE_SECRET` | Optional (falls back to the app secret) | Signs the OAuth `state`; set a dedicated value in production |
| `FACEBOOK_PAGE_ID`, `FACEBOOK_SYSTEM_USER_TOKEN`, `FACEBOOK_PAGE_NAME` | Optional | DryvHub's own Facebook Page for auto-posting listings (System User token; `FACEBOOK_SYSTEM_USER_ACCESS_TOKEN` is accepted as an alias) |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | Optional | Legacy fallback if a Page token is stored directly |
| `FACEBOOK_INCLUDE_PHOTOS` | Optional (default true) | When false, post text only |
| `FACEBOOK_PHOTO_URL_EXPIRES_SECONDS` | Optional (default 3600) | Presigned photo URL lifetime handed to Meta |

### Plate-check (MongoDB)

| Variable | Required? | Purpose |
| -------- | --------- | ------- |
| `MONGODB_URI` | Required for `/plates/*` routes | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Optional (default `platecheck`) | Database name |
| `PLATE_FLAG_IMAGE_MAX_BYTES`, `PLATE_FLAG_IMAGE_VIEW_URL_EXPIRES_SECONDS` | Optional | Evidence image limit and view-URL lifetime |
| `PLATE_FLAG_IMPORT_MAX_BYTES`, `PLATE_FLAG_IMPORT_MAX_ROWS` | Optional (5 MB, 1000 rows) | Bulk import limits |

### Marketplace behavior

| Variable | Required? | Purpose |
| -------- | --------- | ------- |
| `MARKETPLACE_PUBLIC_ORIGIN` | Optional (defaults to a local origin) | Absolute origin for public listing links in Messenger prefill text |
| `MARKETPLACE_INQUIRY_RATE_LIMIT_MAX`, `MARKETPLACE_INQUIRY_RATE_LIMIT_WINDOW_MS` | Optional (5 per 60000 ms) | In-memory throttle for public inquiries and cashback claims, per IP and key |
| `MARKETPLACE_CASHBACK_RATE` | Optional, deprecated | Fallback only if the `platform_settings` row cannot be read; the real source is `platform_settings` |

## `dryvhub-dealer`

Template: `.env.example` (copy to `.env.local`). Next.js reads `.env.local` automatically.

| Variable | Scope | Required? | Purpose |
| -------- | ----- | --------- | ------- |
| `NEXT_PUBLIC_API_URL` | Client and server | **Required** | `dryvhub-api` origin, no trailing slash. The api-client throws if missing |
| `NEXT_PUBLIC_APP_URL` | Client and server | **Required** in practice | Platform origin (sign-in, SEO, metadata, redirect for unknown tenant hosts) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Client and server | Optional locally (defaults to a built-in root) | Apex domain for tenant hosts (`slug.root`) and admin host detection |
| `NEXT_PUBLIC_SUPABASE_URL` | Client and server | **Required** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client and server | **Required** | Supabase anon (public) key. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is read first when present |
| `NEXT_PUBLIC_MARKETPLACE_URL` | Client and server | Optional | When set, dealer profile listing cards link to the marketplace |
| `NEXT_PUBLIC_VEHICLE_IMAGE_MAX_BYTES`, `NEXT_PUBLIC_VEHICLE_DOCUMENT_MAX_BYTES` | Client and server | Optional (10 MB and 15 MB) | Client-side upload size limits; keep aligned with the API |
| `API_URL` | Server only | Optional | Commented out in `.env.example` for a possible Next proxy setup; not read by any code on the checked-out branch |
| `S3_UPLOAD_HOST_ALLOWLIST` | Server only | Optional | Extra hostnames the upload proxy may PUT to (MinIO, local storage) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Server only | Required for signup OTP email | Resend client and sender |
| `OTP_SIGNING_SECRET` | Server only | Required for signup OTP | Signs the short-lived OTP challenge cookie |
| `OTP_PEPPER` | Server only | Optional | Extra secret mixed into OTP hashes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Required for signup OTP | Confirms the user's email through the Supabase Admin API after a correct code |
| `VERCEL_URL` | Server | Provided by Vercel | Fallback for the app URL on Vercel previews |
| `PLAYWRIGHT_BASE_URL` | Test only | Optional | Overrides the Playwright base URL (default `http://localhost:3000`) |

Rules: never expose `SUPABASE_SERVICE_ROLE_KEY`, `OTP_*`, or `RESEND_API_KEY` through `NEXT_PUBLIC_*`.

## `dryvhub-marketplace`

No `.env.example` on the checked-out branch. Names come from `config/api-client.ts`, `next.config.ts`, and `lib/marketplace/site-url.ts`.

| Variable | Scope | Required? | Purpose |
| -------- | ----- | --------- | ------- |
| `NEXT_PUBLIC_API_URL` | Client and server | **Required** (unless `API_URL` is set) | `dryvhub-api` origin. Also the destination of the `/api/:path*` rewrite |
| `API_URL` | Server only | Optional | Preferred over `NEXT_PUBLIC_API_URL` on the server and in the rewrite when the internal URL differs |
| `NEXT_PUBLIC_SITE_URL` | Client and server | Optional (falls back to a local origin) | Canonical origin for metadata, Open Graph, sitemap, and JSON-LD |

The marketplace has **no** Supabase variables because it has no buyer login. If you find yourself adding one, stop and re-read [Marketplace internals](/docs/developers/marketplace-internals).

## Where each variable is used together

| Flow | Variables involved |
| ---- | ------------------ |
| Sign in and API calls (dealer) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`; API side `SUPABASE_URL` |
| Signup OTP | Dealer server: `RESEND_*`, `OTP_*`, `SUPABASE_SERVICE_ROLE_KEY`; API side: `SUPABASE_SERVICE_ROLE_KEY` (register email check) |
| Tenant hosts | `NEXT_PUBLIC_ROOT_DOMAIN`, `NEXT_PUBLIC_APP_URL`; API `CORS_ORIGINS` |
| Image and document upload | API `S3_*` and expiry vars; dealer `S3_UPLOAD_HOST_ALLOWLIST` and size limits |
| Facebook connect | API `FACEBOOK_*`; callback path in the dealer app must match `FACEBOOK_REDIRECT_URI` |
| Buyer browsing | Marketplace `NEXT_PUBLIC_API_URL` or `API_URL`; API `CORS_ORIGINS` (direct calls) |

## Related pages

- [Local setup](/docs/developers/local-setup)
- [Auth and tenancy](/docs/developers/auth-and-tenancy)
- [Architecture](/docs/developers/architecture)
