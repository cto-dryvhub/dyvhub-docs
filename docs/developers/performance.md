---
title: Performance
sidebar_position: 11
description: "The Wave 1 dealer-portal performance decisions, what is deferred to Wave 2 and the API, and how to measure before claiming a win."
---

# Performance

**What this page covers:** what the dealer app's performance work (Wave 0 and Wave 1) changed and why, what is deliberately deferred (Wave 2 and an API N+1 problem), and how to verify performance changes honestly. Source: `dryvhub-dealer/docs/plans/performance-optimization.md` and `ARCHITECTURE.md`.

:::tip[In plain English]
Slow screens usually come from doing too much JavaScript before the user sees anything, or from the browser asking the server for things one after another instead of together. Wave 1 trimmed what loads on public pages, stopped the dashboard from waiting on unnecessary data, and delayed heavy chart code. **Measure first, change second, measure again**: lines of code or file sizes are not user-visible speed.
:::

## Status

- **Wave 0 and Wave 1: implemented** in `dryvhub-dealer` (plan status: review had no Critical items).
- **Wave 2: deferred** (needs real-user data or large inventories to justify).
- **API N+1 on inventory: deferred** to a `dryvhub-api` cycle.
- Lighthouse and field Core Web Vitals (AC-14) must be recorded per change. The plan's baseline numbers were from a local compile, not field data, and are not a performance claim.

## The original problems

| Surface | Problem found |
| ------- | ------------- |
| Root layout | Query, Auth, Tooltip, and Toaster providers wrapped every route, so even legal pages shipped the Supabase and React Query JavaScript |
| Login and legal pages | Hydrated the same large client graph as the dashboard |
| Dashboard home | Waited on fetching **all** vehicles page by page (sequentially) before showing content, and included the charting library up front |
| Guards | Treated every background refetch of tenant-user data as "loading" and replaced the screen; onboarding data blocked page queries |
| Fonts | Three font families preloaded on every route, one unused |
| Images | No `next/image`; full-resolution signed URLs for galleries |
| Build | `next build` failed type-checking because of a missing type used by an E2E helper (fixed in Wave 0) |

## Wave 1 decisions (implemented)

| Decision | What it means for you |
| -------- | --------------------- |
| **Route-group providers** | `QueryProvider` and `AuthProvider` live only in `app/(session)/layout.tsx`. Legal pages live in `app/(public)/` and load neither |
| **Per-provider QueryClient** | `createQueryClient()` runs inside `QueryProvider`, not as a module singleton |
| **Dashboard shell in a layout** | `DashboardShell` is in `dashboard/layout.tsx`, so the sidebar does not remount between pages. New pages are Server Components that import a client island |
| **Guards stop blocking** | Tenant-user "loading" means "no cached data yet", not "fetching". Onboarding is warmed in parallel and only overlays errors. The tenant-documents query is not enabled on every page |
| **Dashboard home** | KPI cards depend on the sales-summary query; no `fetchAll` of vehicles for first paint |
| **Lazy charts** | Recharts is loaded through `*-dynamic.tsx` wrappers (`next/dynamic`) with a min-height skeleton to prevent layout shift |
| **Fonts** | Inter for UI plus Geist Mono for code-like text. Geist Sans was removed |
| **Images** | Gallery images get `fetchPriority="high"` on the first confirmed image and `decoding="async"` on the rest. **No** `next/image` on signed `viewUrl` or `blob:` URLs (the optimizer would cache short-lived signed URLs) |
| **HTTP caching** | Bearer API calls stay `cache: "no-store"`. Only the public tenant-by-subdomain lookup (used by `proxy.ts`) may use a short revalidate window, and the tenant landing page wraps it in `React.cache` |
| **Dependencies** | Removed unused `@dnd-kit/*`, `@tanstack/react-table`, and `next-themes`; `next.config.ts` disables the `X-Powered-By` header and optimizes imports for large icon and UI libraries |

These are enforced as rules in [Dealer app internals](/docs/developers/dealer-app-internals).

## Deferred work

| Item | Why it is deferred | Owner |
| ---- | ------------------ | ----- |
| **Inventory expense-summary N+1**: the inventory list calls `GET /vehicles/:id/expenses/summary` once per visible row | Needs an API change (a batch endpoint or an `expenseTotal` field on list rows). A client-side loop "fix" would be fake. Keep the current behavior until the API supports it | `dryvhub-api` (AC-15) |
| **Dashboard inventory snapshot endpoint** so home never needs to scan all vehicles | Needs a new API aggregate | `dryvhub-api` |
| **Stable CDN thumbnail URLs** for gallery LCP | Only worth it if gallery LCP stays high after the image attribute fixes | `dryvhub-api` |
| **Wave 2: vehicle detail seeded from list cache** plus prefetch on row hover; move image and document loads to React Query | Wait for real-user data or large inventories | Dealer app |
| **Wave 2: dynamic-import heavy dialogs** (`CreateVehicleDialog`, expense sheets) | Same | Dealer app |
| **Wave 2: finish splitting the onboarding hook file** if Wave 1's split was incomplete | Low risk, low gain | Dealer app |
| **Vercel Speed Insights** | Optional after the provider split to get real-user metrics | Ops |

Explicitly **out of scope**: speculative `useMemo` or `React.memo`, Edge runtime for `proxy.ts`, Cache Components on authenticated JSON, Redux or Zustand, and rewriting the API from the dealer repo.

## Marketplace notes

The marketplace is mostly Server Components with client islands, a single font (Outfit), and React Query only where `/vehicles` needs it. Keep the homepage free of React Query unless a plan says otherwise. See [Marketplace internals](/docs/developers/marketplace-internals).

## API-side notes

- Tenant context does one indexed lookup of `tenant_users` per authenticated request (ADR-0003). It could be cached if traffic grows; today it is negligible.
- JWT verification is local (no per-request network call), a deliberate latency win (ADR-0004).
- Image and document bytes never pass through the API (presigned S3 uploads, ADR-0010).
- Report and list endpoints are paginated or exportable; prefer pagination for new bulk reads.

## How to measure honestly

1. Run `npx next build` and record First Load JS for `/`, `/legal/privacy`, and `/dashboard` before and after any layout, provider, or `next.config.ts` change.
2. Run a throttled Lighthouse pass on `/`, `/dashboard`, and `/dashboard/inventory`; note the LCP element, JS bytes, and font requests.
3. Do **not** claim a Core Web Vitals improvement from bundle-size sums alone. Sizes are a proxy; LCP and INP come from Lighthouse or real-user monitoring.
4. Put the numbers in your implementation notes (see [Adding a feature](/docs/developers/adding-a-feature)).

## Related pages

- [Dealer app internals](/docs/developers/dealer-app-internals)
- [Architecture](/docs/developers/architecture)
- [Decisions](/docs/developers/decisions)
- [Testing](/docs/developers/testing)
