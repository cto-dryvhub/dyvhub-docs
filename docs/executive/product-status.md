---
title: Product status
sidebar_position: 6
description: What is Live, In progress, and Planned across the Dealer app, the Marketplace, and the API, with the evidence behind each label.
---

# Product status

:::tip[Key takeaways]
- The **core dealer loop is live**: sign up, verify, add cars, publish, receive inquiries, record sales, track money, and claim or review cashback.
- The **gaps are around money and administration**, not around listings: no self-service billing or checkout, no admin screens for platform settings or cashback review, and several admin screens that call API routes we could not find.
- The **Marketplace is fully read-only for buyers** except for the two public actions (inquiry and cashback claim). It has no end-to-end browser tests.
- A label here means **"we found code that does this"**, not "it has been proven in production". We did not run the apps; test counts in the repos are not evidence of passing.
:::

## How to read this page

| Label | Meaning |
| --- | --- |
| **Live** | Code exists in the app **and** in the API (where an API is needed) and is reachable by users |
| **In progress / Partial** | Some of the feature exists, or one side exists without the other, or it works but with a known gap |
| **Planned** | A plan, a decision record, or a data model exists, but we found no working code path |

Plans alone never count as shipped. Snapshot date: **November 2026** (code on the `staging` branch of the API and the working copies of the other two repositories).

## Summary

| Area | Live | In progress / Partial | Planned |
| --- | --- | --- | --- |
| Dealer app | 16 | 4 | 4 |
| Marketplace | 7 | 1 | 2 |
| API | 10 | 4 | 4 |

## Dealer app

| Capability | Status | Evidence |
| --- | --- | --- |
| Signup with email code, sign-in | **Live** | Dealer sign-up pages and three Route Handlers; API `POST /auth/register`; Resend for the code |
| Onboarding checklist, document upload, submit for review | **Live** | `/dashboard/onboarding`; API `tenants/current/onboarding` and `tenants/current/documents` |
| Verification status page (Stage 1 → Stage 2) | **Live** | `/dashboard/verification`; API `admin/tenant-verifications` on the review side |
| Inventory list, add, detail, photos, documents | **Live** | `/dashboard/inventory`; API `vehicles` endpoints |
| Vehicle expenses and overhead | **Live** | Services for expenses and overhead; API `vehicles/:id/expenses`, `financials` |
| Record a sale | **Live** | API `POST vehicles/:id/sale`; sale form plans |
| Financials (sales summary, summary, payments, expenses) | **Live** | `/dashboard/financials`; API `financials` controller |
| Reports (sales, inventory, profit, expense) | **Live** | `/dashboard/reports`; four report services; API `reports` controller |
| Listings: publish and unpublish to Marketplace | **Live** | `/dashboard/listings`; API `vehicles/:id/listing/*` |
| Facebook Page connect, auto-post, bump | **Live** (needs Meta setup) | `/dashboard/settings/facebook`; API `tenants/current/facebook/*`, `listing/facebook/bump` |
| PlateCheck search, report, import | **Live** (advisory) | `/dashboard/platecheck`; API `plates/*`; does not block listings |
| Inquiries page | **Live** | `/dashboard/inquiries`; API `GET /inquiries` |
| Dealer cashback (confirm, dispute, add proof) | **Live** | `/dashboard/cashback`; API `cashback/claims/*` |
| Dealer profile (logo, cover, public landing) | **Live** | `/dashboard/dealer-profile`; API by-subdomain profile endpoints |
| Access banner and locked states | **Live** | Mirrors the backend access policy |
| Admin: verification review queue | **Live** | `/admin` portal; API `admin/tenant-verifications` |
| Billing page (plan, limits, invoices) | **Partial** | Shows plans; upgrade dialog states checkout "is not live yet"; no billing endpoints in the API |
| Storage page | **Partial** | Shows usage; no upload cap enforced was found |
| Admin: tenant list, follow-ups, vehicle management | **Partial** | Screens exist; they call `/admin/me`, `/admin/tenants`, `/admin/tenant-follow-ups`, `/admin/vehicles/*`, which we **did not find** in the API |
| Admin: cashback review and payout screens | **Partial** | The API endpoints exist; we did not find matching screens |
| Platform settings screen (cashback rates, promo) | **Planned** | API exists; no UI found |
| Staff invitations | **Planned** | ADR-0008 defers it; data model has a staff role |
| Online checkout and automated billing | **Planned** | ADR-0011 is "Proposed" (PayMongo); no code |
| Live notifications | **Planned** | A notification stream exists in the API with no publishers; no UI use found |

## Marketplace (buyer site)

| Capability | Status | Evidence |
| --- | --- | --- |
| Home with search, categories, featured, buying guide | **Live** | `app/page.tsx`; listing fetch from the API |
| Vehicle browse with filters, sort, pagination, Coming Soon tab | **Live** | `app/vehicles/page.tsx`; API `GET marketplace/listings` |
| Vehicle details with gallery, specs, structured data | **Live** | `app/vehicles/[id]/page.tsx`; API `GET marketplace/listings/:id` |
| Send Inquiry → Messenger | **Live** | `inquiry-modal.tsx`; API `POST marketplace/listings/:vehicleId/inquiries` |
| Cashback claim and evidence follow-up | **Live** | `app/purchases/cashback`; API `cashback/claims` |
| Dealer recruitment page | **Live** | `app/for-dealers/page.tsx` |
| SEO: sitemap, robots, metadata | **Live** | `app/sitemap.ts`, `app/robots.ts` |
| Cashback amount shown to buyers | **Live** | Flat ₱2,000 in copy and in the claim amount the API stores |
| Report a listing | **Planned** | Not found; also not in any plan we read |
| Browser (E2E) tests | **Planned** | No `test:e2e` script; unit tests only |

Buyer accounts are **not planned** by design.

## API

| Capability | Status | Evidence |
| --- | --- | --- |
| Registration, tenancy, onboarding, verification workflow | **Live** | `auth`, `tenants`, `tenant-users`, `admin/tenant-verifications` controllers |
| Vehicles, documents, expenses, sale, listing publish | **Live** | `vehicles` controller; use-cases with unit tests |
| Financials and reports | **Live** | `financials`, `reports` controllers |
| Public marketplace listings and details | **Live** | `marketplace` controller; eligibility filter in the data service |
| Inquiries (public create, dealer list) | **Live** | `marketplace` and `inquiries` controllers |
| Cashback claims (public), dealer actions, admin review and payout | **Live** | `cashback`, `dealer-cashback`, `admin/cashback/claims` controllers |
| Platform settings (rates, promo) | **Live** | `admin/platform-settings` controller |
| Facebook connection and publishing | **Live** | `tenants/current/facebook`, listing sync |
| PlateCheck registry | **Live** (advisory) | `plates` controller; MongoDB |
| Dealer access policy | **Live** | One shared rule, unit-tested |
| `/admin/me`, `/admin/tenants`, `/admin/tenant-follow-ups`, `/admin/vehicles/*` | **Partial** | Called by the Dealer app; not found here |
| Rate limiting | **Partial** | In memory (single process); DRY-103 defers a shared version |
| Notifications stream | **Partial** | Endpoint exists; no publishers |
| API documentation | **Partial** | README lists about 30 endpoints; code has about 99; Swagger is the better source |
| Billing and plan changes | **Planned** | No endpoints; plan is changed outside the app |
| Inquiry lifecycle (open, won, lost) | **Planned** | DRY-99 |
| Automatic cashback payouts | **Planned** | Not designed. The cashback payout plan (DRY-102) records payouts by hand and has no GCash or bank integration. ADR-0011 covers dealer subscriptions only, not payouts |
| Expense-summary N+1 fix | **Planned** | Deferred performance item |

:::warning Counts are the author's tally
The "Live / Partial / Planned" counts in the summary table were counted from the tables on this page. They describe **breadth of features**, not completeness or quality. One partial item (for example, billing) can matter more to the business than several live ones.
:::

## What blocks real revenue today

1. No way for a dealer to **pay and upgrade** in the product.
2. No **billing engine** to move a plan between trial, active, past due, and suspended.
3. **Cashback copy** and **cashback math** disagree.
4. **Admin tooling** for rates and cashback review is not in the Dealer app.

See [Business model](/docs/executive/business-model) and [Risks and dependencies](/docs/executive/risks-and-dependencies).

## Related pages

- [Overview](/docs/executive/overview)
- [Dealer journey](/docs/executive/dealer-journey)
- [Buyer journey](/docs/executive/buyer-journey)
- [Trust and safety](/docs/executive/trust-and-safety)
- [Dealer overview](/docs/dealer/overview)
- [Admin portal](/docs/dealer/admin-portal)
- [Marketplace overview](/docs/marketplace/overview)
- [Architecture](/docs/developers/architecture)
