---
title: Dealer app internals
sidebar_position: 8
description: "How dryvhub-dealer is built: route groups, provider placement, dashboard shell, guards, data layering, Route Handlers, proxy.ts, and the performance rules that must not regress."
---

# Dealer app internals

**What this page covers:** the structure of `dryvhub-dealer` (Next.js 16 App Router): which routes live where and why, where providers are mounted, how the dashboard shell and guards compose, how data flows from API to screen, the thin server endpoints, and the performance rules you must not break.

:::tip[In plain English]
Next.js lets some code run on the server (fast first paint, no JavaScript sent) and some in the browser (interactive). The dealer app puts the *logged-in* parts in one "session" bucket that loads Supabase and React Query, and keeps public pages (legal, dealer profiles) in a separate bucket that loads neither, so they stay light. Pages are mostly thin server files that mount one interactive "island".
:::

Product view: [Dealer overview](/docs/dealer/overview). Architecture context: [Architecture](/docs/developers/architecture).

## Route groups

Route groups (folders in parentheses) organize code and layouts without changing URLs.

```text
app/
  layout.tsx                 fonts + html/body only
  (public)/                  RSC, no Supabase, no React Query
    legal/privacy, legal/terms
    dealers/[slug]           public dealer profile
  (session)/
    layout.tsx               QueryProvider + AuthProvider + Toaster
    page.tsx                 "/" platform login
    login, dealer/*          dealer login, signup, OTP verify, reset password
    auth/handoff             receives the session from another origin
    tenant/[subdomain]       public tenant landing (rewritten from slug host "/")
    onboarding               onboarding wizard
    dashboard/               authenticated workspace
    admin/                   platform-admin portal
  api/                       thin Route Handlers (see below)
```

| Rule | Why |
| ---- | --- |
| `QueryProvider` and `AuthProvider` mount **only** in `app/(session)/layout.tsx` | Keeps legal and public profile pages free of Supabase and React Query JavaScript |
| Root `app/layout.tsx` has fonts and `html`/`body` only | Anything added here is paid for by every route |
| Do not flatten `(public)` and `(session)` into one provider tree | It would re-inflate First Load JS on legal pages. A plan that re-measures is required first |
| `createQueryClient()` runs inside `QueryProvider` | A module-level singleton would leak cache between users on the server |

## Dashboard shell and pages

`app/(session)/dashboard/layout.tsx` composes the authenticated frame once:

```text
RequireAuth (roles: super_admin legacy, owner, staff)
  RequireOnboarding
    TooltipProvider
      DashboardShell (sidebar, header)
        {page}
```

The layout also sets `noindex` robots metadata so authenticated pages stay out of search indexes.

Pages under `dashboard/` (`inventory`, `listings`, `financials`, `reports`, `inquiries`, `cashback`, `platecheck`, `storage`, `verification`, `billing`, `dealer-profile`, `settings`, `onboarding`) follow one pattern:

1. `page.tsx` is a **Server Component** that does no fetching of its own.
2. It imports a **client island** from `components/<domain>/` that uses hooks.
3. `loading.tsx` is added when the route needs a skeleton.

When you add a route, copy `reports` or `financials`. Do not put `DashboardShell` in individual pages; it lives in the layout so navigation does not remount the sidebar.

Billing pages exist in the repo, but the full subscription flow is **Planned** (API ADR-0011 is still "Proposed").

## Guards

Guards are client components that wrap UI. They are a UX layer; the API enforces real access. Full behavior is in [Auth and tenancy](/docs/developers/auth-and-tenancy).

| Guard | Used on |
| ----- | ------- |
| `RequireAuth` | Dashboard layout (with role allow-list) |
| `RequireOnboarding` | Dashboard layout; error overlay only |
| `RequirePlatformAdmin` | Admin portal layout |
| `RedirectAuthed` | Login and signup pages |

Performance-related guard rules:

- Do **not** block dashboard page queries on the onboarding response.
- Tenant-user loading means "no cached data yet" (`isPending` without data), **not** `isFetching`. Otherwise every background refetch would replace the app with a loading screen.
- Do not enable the tenant-documents query on every authenticated page.
- Never render privileged lists before the role is known.

## Data layering

```text
config/api-client.ts      HTTP, Bearer header, ApiHttpError
services/*.service.ts     endpoint adapters, zod parsing
hooks/<domain>/use*.ts    TanStack Query (keys, enabled flags, invalidation)
lib/<domain>/*            pure helpers (no fetch, no endpoint paths)
types/api/*               response and payload interfaces
components/ + app/        UI
```

Details:

- Hooks get the access token from `useAuth()` and pass `enabled: Boolean(accessToken)`.
- Query defaults (`createQueryClient`): `retry: 1`, `staleTime: 30_000`, `refetchOnWindowFocus: false`. Override per query only with a reason.
- Mutations invalidate the narrowest query keys that changed.
- Bearer requests use `cache: "no-store"`. Only the public tenant-by-subdomain lookup may use a short revalidate window.
- Services parse important payloads with zod or typed parsers (for example the admin service parses sessions, tenants, and vehicle lists).
- Do not put transport code in `lib/` or React Query in `services/`.

## Route Handlers (`app/api/`)

Route Handlers are **thin server-side helpers**, not a second backend. Domain CRUD belongs in `dryvhub-api`.

| Route | Purpose | Notes |
| ----- | ------- | ----- |
| `POST /api/auth/signup/send-otp` | Generate a 6-digit code, email it with Resend, set the signed `otp_challenge` httpOnly cookie | zod-validated; in-memory rate limits (3 sends per email and 10 per IP per 15 minutes); needs `RESEND_*` and `OTP_SIGNING_SECRET` |
| `POST /api/auth/signup/verify-otp` | Check the code against the signed challenge, then confirm the user's email through the Supabase Admin API and clear the cookie | Needs `SUPABASE_SERVICE_ROLE_KEY`; server only |
| `POST /api/vehicle-images/upload` | Same-origin proxy that forwards a file to the presigned S3 PUT URL | Verifies the caller's bearer token with Supabase, only allows known S3 hosts (`S3_UPLOAD_HOST_ALLOWLIST` adds more), returns `204` on success, `502` with a hint on S3 errors |

Why the OTP is stateless (ADR-0001): no database table, so no migration. The trade-offs are that the challenge is bound to the browser that requested it, and in-memory rate limits are per server instance. See [Decisions](/docs/developers/decisions).

Route Handler rules: validate input with zod, return `{ error: { code, message, details? } }`, never log secrets, and set `export const runtime = "nodejs"` where Node APIs are needed.

## `proxy.ts` (tenant host rewrite)

`proxy.ts` is the Next.js 16 name for middleware. It routes by **host only**: no cookies, no auth, no data access beyond a public tenant-exists check.

| Case | Behavior |
| ---- | -------- |
| Internal paths (`/api`, `/_next`, icons) | Pass through |
| `admin.<root>` | `/login` becomes `/admin/login` |
| `<slug>.<root>` and `/` | Rewrite to `/tenant/<slug>` |
| `<slug>.<root>` and `/login` | Rewrite to `/dealer/login` |
| Invalid slug, or unknown slug on an auth path | Redirect to the platform login (`buildGlobalLoginRedirectUrl`) |
| Everything else on a tenant host | Unchanged; `x-tenant-subdomain` header is added for convenience |

The existence check calls the public `GET /api/v1/tenants/by-subdomain/:subdomain` through `isTenantSubdomainRegistered`. Helpers live in `lib/tenant/` (`proxy-routing.ts`, `resolve-subdomain.ts`, `admin-host.ts`, `tenant-host-url.ts`, `session-handoff.ts`, `post-login-navigation.ts`).

## Performance rules that must not regress

These come from the "Wave 1" optimization (see [Performance](/docs/developers/performance)). Breaking them silently costs every dealer load time.

| Area | Rule |
| ---- | ---- |
| Providers | Auth and Query only in `(session)/layout.tsx` |
| Dashboard shell | Only in `dashboard/layout.tsx`; new pages are RSC plus a client island |
| Lists | No `fetchAll` of vehicles for dashboard-home first paint |
| Charts | Never static-import Recharts; use the existing `*-dynamic.tsx` wrappers with a min-height skeleton |
| HTTP | Bearer calls stay `no-store` |
| Images | No `next/image` on signed `viewUrl` or `blob:` previews (the optimizer would cache short-lived signed URLs) |
| Fonts | Inter plus Geist Mono only; do not add `next/font` families on the root layout |
| Dependencies | Do not re-add `@dnd-kit/*`, `@tanstack/react-table`, or `next-themes` without a feature plan |
| Verification | After touching layouts, providers, or `next.config.ts`, run `npx next build` and record First Load JS for `/`, `/legal/privacy`, and `/dashboard` in your notes. Do not claim a Core Web Vitals win without a measurement |

## UI conventions

- Use shadcn primitives from `components/ui/` before inventing new ones; icons from `lucide-react`; `cn()` from `lib/utils.ts`.
- Tailwind 4 with CSS variables in `app/globals.css`. Design tokens: `.claude/docs/DESIGN_THEME_REFERENCE.md` in the dealer repo.
- Every input has a label; interactive elements are keyboard reachable; use `data-testid` only when role or label is not enough.
- Toasts through `sonner`. Server state only through TanStack Query; no Redux, Zustand, or Jotai.

## Related pages

- [Auth and tenancy](/docs/developers/auth-and-tenancy)
- [API integration](/docs/developers/api-integration)
- [Performance](/docs/developers/performance)
- [Testing](/docs/developers/testing)
- [Adding a feature](/docs/developers/adding-a-feature)
