---
title: Data model
sidebar_position: 7
description: "PostgreSQL schema overview with relationship diagrams, a model-to-purpose table, and conventions for money, timestamps, and tenant scoping."
---

# Data model

**What this page covers:** the PostgreSQL tables behind the API (defined in `dryvhub-api/prisma/schema.prisma`), how they relate, and the conventions every new table must follow. A second datastore, MongoDB, holds only the plate-check registry and is covered at the end.

:::tip[In plain English]
The database has one **tenants** table (one row per dealership). Almost every other table has a `tenantId` column pointing back to it, which is how the API keeps each dealership's data separate. Vehicles are the center of the model: images, documents, expenses, sales payments, marketplace inquiries, and cashback claims all hang off a vehicle.
:::

`schema.prisma` is the source of truth. If this page and the schema disagree, the schema wins. Change it only through the Prisma CLI workflow in [Local setup](/docs/developers/local-setup).

## Relationships

These diagrams list every foreign key in `schema.prisma`. Columns are omitted. `||` is exactly one, `|o` is zero or one, `o{` is zero or more.

`platform_settings` has no foreign keys. It is a single global row.

UUID columns that are **not** foreign keys, and so do not appear below: `vehicle_document_type.created_by`, `vehicle_documents.uploaded_by`, `vehicle_expenses.counterparty_id` and `created_by`, `financial_transactions.counterparty_id`, `reversal_of_transaction_id`, `voided_by`, and `created_by`, `monthly_overhead.counterparty_id`, and `audit_logs.entity_id`.

### Spine

The path from a dealership to a vehicle, then out to money and cashback. Tenant edges that only repeat `tenantId` are on the domain diagrams.

```mermaid
erDiagram
  TENANT ||--o{ TENANT_USER : members
  TENANT_USER |o--o{ TENANT_USER : invites
  TENANT ||--o{ TENANT_LOCATION : addresses
  TENANT_LOCATION |o--o{ VEHICLE : "stock location"
  TENANT ||--o{ VEHICLE : owns
  VEHICLE ||--o{ VEHICLE_IMAGE : photos
  VEHICLE ||--o{ VEHICLE_DOCUMENT : documents
  VEHICLE_DOCUMENT_TYPE ||--o{ VEHICLE_DOCUMENT : classifies
  VEHICLE ||--o{ VEHICLE_EXPENSE : costs
  VEHICLE_EXPENSE |o--o| FINANCIAL_TRANSACTION : "ledger row"
  VEHICLE |o--o{ FINANCIAL_TRANSACTION : "optional vehicle"
  VEHICLE ||--o{ MARKETPLACE_INQUIRY : inquiries
  MARKETPLACE_INQUIRY ||--o| CASHBACK_RECORD : "may become"
  VEHICLE ||--o| CASHBACK_RECORD : "at most one"
  CASHBACK_RECORD ||--o{ CASHBACK_DEALER_EVIDENCE : evidence
  CASHBACK_RECORD |o--o{ DEALER_STRIKE : "may cause"
```

### Identity and tenancy

```mermaid
erDiagram
  TENANT ||--o{ TENANT_USER : members
  TENANT_USER |o--o{ TENANT_USER : invites
  TENANT ||--o{ TENANT_LOCATION : addresses
  TENANT ||--o{ TENANT_ONBOARDING_DOCUMENT : uploads
  TENANT ||--o{ TENANT_VERIFICATION_DECISION : "decision history"
  PLATFORM_USER ||--o{ TENANT_VERIFICATION_DECISION : decides
  PLATFORM_USER ||--o{ AUDIT_LOG : acts
```

Deleting a tenant cascades to members, locations, and onboarding documents. Deleting a platform user is restricted while they still have verification decisions or audit rows. Deleting the member who sent an invite sets `invitedById` to null.

### Inventory

```mermaid
erDiagram
  TENANT ||--o{ VEHICLE : owns
  TENANT_LOCATION |o--o{ VEHICLE : "stock location"
  TENANT ||--o{ VEHICLE_IMAGE : owns
  VEHICLE ||--o{ VEHICLE_IMAGE : photos
  TENANT ||--o{ VEHICLE_DOCUMENT : owns
  VEHICLE ||--o{ VEHICLE_DOCUMENT : files
  VEHICLE_DOCUMENT_TYPE ||--o{ VEHICLE_DOCUMENT : classifies
```

`Vehicle.locationId` is optional. Deleting a location sets it to null. Images, documents, and the vehicle itself cascade when the tenant or the vehicle is deleted. A document type cannot be deleted while documents still reference it.

### Money

```mermaid
erDiagram
  TENANT ||--o{ VEHICLE_EXPENSE : owns
  VEHICLE ||--o{ VEHICLE_EXPENSE : incurs
  TENANT ||--o{ FINANCIAL_TRANSACTION : owns
  VEHICLE |o--o{ FINANCIAL_TRANSACTION : "optional vehicle"
  VEHICLE_EXPENSE |o--o| FINANCIAL_TRANSACTION : "optional ledger row"
  TENANT ||--o{ MONTHLY_OVERHEAD : tracks
  TENANT_USER |o--o{ MONTHLY_OVERHEAD : "created by"
  TENANT ||--o{ LEGACY_FINANCIAL_IMPORT_BATCH : imports
  TENANT_USER |o--o{ LEGACY_FINANCIAL_IMPORT_BATCH : "imported by"
  TENANT ||--o{ LEGACY_FINANCIAL_RECORD : owns
  LEGACY_FINANCIAL_IMPORT_BATCH ||--o{ LEGACY_FINANCIAL_RECORD : contains
```

`financial_transactions.vehicle_id` and `vehicle_expense_id` are both optional. `vehicle_expense_id` is unique, so an expense has at most one ledger row. Deleting a vehicle or an expense sets those columns to null. Deleting the member who created overhead or an import batch does the same for `created_by` and `imported_by`. The batch delete cascades to its records.

### Marketplace and cashback

```mermaid
erDiagram
  TENANT ||--o{ MARKETPLACE_INQUIRY : receives
  VEHICLE ||--o{ MARKETPLACE_INQUIRY : listing
  TENANT ||--o{ CASHBACK_RECORD : "dealer on the claim"
  VEHICLE ||--o| CASHBACK_RECORD : "at most one"
  MARKETPLACE_INQUIRY ||--o| CASHBACK_RECORD : "inquiry code"
  PLATFORM_USER |o--o{ CASHBACK_RECORD : reviews
  TENANT ||--o{ CASHBACK_DEALER_EVIDENCE : owns
  CASHBACK_RECORD ||--o{ CASHBACK_DEALER_EVIDENCE : evidence
  TENANT ||--o{ DEALER_STRIKE : penalized
  CASHBACK_RECORD |o--o{ DEALER_STRIKE : "optional claim"
```

A cashback row requires both a vehicle and an inquiry, and both links are unique, so each vehicle and each inquiry has at most one claim. Those two foreign keys, and the tenant foreign key on `cashback_records` and `dealer_strikes`, use `Restrict`: a tenant, vehicle, or inquiry cannot be deleted while a claim still points at it. Reviewer and strike-to-claim links are optional and set to null on delete. Inquiry rows cascade with the tenant and the vehicle. Evidence cascades with the claim.

## Models and purpose

Table names are the snake_case names from `@@map`.

### Identity and tenancy

| Model | Table | Purpose | Tenant-scoped? |
| ----- | ----- | ------- | -------------- |
| `Tenant` | `tenants` | One dealership: business and public-profile fields, unique `subdomain`, subscription plan and status, trial dates, limits (inventory, admins, storage), verification stage and status, Facebook connection fields, cashback eligibility | Is the tenant |
| `TenantUser` | `tenant_users` | A dealership member. Unique `authUserId` (the Supabase user id), role `owner` or `staff`, active flag. This table is the **only** source of tenant identity | Yes |
| `TenantLocation` | `tenant_locations` | A dealership's physical address: street lines, barangay, city, province, region, postal code, country, the PSGC codes for the last three, coordinates and geocoding metadata, and the `isPrimary` / `isShowroom` / `isActive` / `locationVerified` flags. A tenant has many; exactly one may be primary and active at a time (ADR-0013, ADR-0014) | Yes |
| `PlatformUser` | `platform_users` | DryvHub staff. Unique `authUserId`, role `admin`, active flag | Global |
| `TenantVerificationDecision` | `tenant_verification_decisions` | History of approve or reject decisions by platform admins, with reason | Yes |
| `AuditLog` | `audit_logs` | Admin action trail (actor, action, entity, JSON metadata) | Global (actor is a platform user) |
| `PlatformSettings` | `platform_settings` | Single settings row: cashback rate, dealer fee, platform revenue share, promo window and promo rate | Global |

### Inventory

| Model | Table | Purpose |
| ----- | ----- | ------- |
| `Vehicle` | `vehicles` | Core inventory record: make, model, year, mileage, `price`, `plateNumber`, category, transmission, fuel, status (`draft`, `active`, `available`, `coming`, `reserved`, `sold`, `archived`), listing status (`draft`, `pending_review`, `published`, `held`, `blocked_platecheck`), per-channel sync status (marketplace, Facebook), private fields (purchase price, buyer, agent, dealer notes), `tenantId`+`refId` unique |
| `VehicleImage` | `vehicle_images` | Photo metadata and S3 `objectKey`; status `pending` then `uploaded` |
| `VehicleDocumentType` | `vehicle_document_type` | Global master list (OR, CR, insurance, deed of sale, ...) with fixed ids |
| `VehicleDocument` | `vehicle_documents` | Document metadata, S3 path, status, `isVerified` |
| `TenantOnboardingDocument` | `tenant_onboarding_documents` | Business verification documents uploaded during onboarding |

### Money

| Model | Table | Purpose |
| ----- | ----- | ------- |
| `VehicleExpense` | `vehicle_expenses` | Per-vehicle cost (soft-deleted via `deletedAt`) |
| `FinancialTransaction` | `financial_transactions` | Payments and costs ledger with direction, category, status, payment method; unique `tenantId`+`transactionNumber` |
| `MonthlyOverhead` | `monthly_overhead` | Recurring monthly business overhead (soft-deleted) |
| `LegacyFinancialImportBatch`, `LegacyFinancialRecord` | `legacy_financial_*` | Imported historical records from before DryvHub, grouped by batch (soft-deleted) |

### Marketplace and cashback

| Model | Table | Purpose |
| ----- | ----- | ------- |
| `MarketplaceInquiry` | `marketplace_inquiries` | A buyer inquiry on a listing: unique `inquiryCode`, source (Messenger), entry point (card or details), cashback rate locked at inquiry time, optional buyer and agent names |
| `CashbackRecord` | `cashback_records` | A buyer's cashback claim tied to an inquiry code and **one vehicle** (`vehicleId` unique). Tracks status from `pending_review` through `approved`, `paid`, or `rejected`/`disputed`, locked rate, dealer fee, buyer and platform amounts, payout method and reference, reviewer |
| `CashbackDealerEvidence` | `cashback_dealer_evidence` | Dealer-provided evidence files for a claim (OR/CR, sales proof, release) |
| `DealerStrike` | `dealer_strikes` | Penalty record against a dealer, optionally linked to a claim |

## Conventions

| Convention | Rule |
| ---------- | ---- |
| Primary keys | UUID (`@id @default(uuid()) @db.Uuid`), generated by the app layer |
| Tenant scoping | Every tenant-owned table has `tenantId` with a foreign key to `tenants`. Every query adds `where: { tenantId }` (ADR-0005). Global tables are only `platform_users`, `platform_settings`, `audit_logs`, `vehicle_document_type`, and `tenants` itself |
| Money | `Decimal` (for example `@db.Decimal(14, 2)` for amounts, `Decimal(5, 2)` for percentages). Never `Float`. Serialize decimals as strings in JSON to avoid precision loss |
| Timestamps | `DateTime @db.Timestamptz(6)`, always UTC. `createdAt` defaults to `now()`; `updatedAt` uses `@updatedAt` |
| Dates without time | `@db.Date` (for example `Vehicle.acquiredAt`) |
| Enums | Prisma enums in the schema; the core domain uses string unions and maps at the boundary |
| Soft delete | `deletedAt` on expenses, overhead, and legacy data; `archivedAt` and `status = archived` on vehicles; `deleted` status on documents |
| Naming | PascalCase models and camelCase fields in Prisma; snake_case plural table names through `@@map` |
| Indexes | Composite indexes lead with `tenantId` (for example `tenantId, status`) so tenant-scoped queries stay fast |
| Cascades | Tenant children cascade on tenant delete; financially significant records (`cashback_records`, `dealer_strikes`) use `Restrict` |
| Secrets in rows | The tenant row stores a Facebook access token (`fbAccessToken`). Never return it from an endpoint or log it |
| Prisma client | Generated into `src/generated/prisma` (gitignored). Core entities in `src/core/entities` are plain interfaces, never Prisma types |

Schema changes always follow: edit `schema.prisma`, run `npx prisma migrate dev --name <name>`, run `npx prisma generate`, then update entities, ports, data services, and tests. Never author migration SQL from scratch — always let Prisma generate the file. A generated migration may be **extended** by hand for things Prisma cannot express (a partial unique index, a data backfill), and when it is, say so in the migration header.

## Planned or partial

- Subscription and billing columns exist on `tenants` (plan, status, trial and renewal dates, limits). A full billing flow (API ADR-0011, dealer plan `docs/plans/subscription-billing.md`) is **Planned**, not shipped.
- Row-level security in PostgreSQL was considered and deferred (ADR-0005 explains why manual filtering was chosen first and lists the triggers to revisit it).

## MongoDB (plate-check registry)

Plate-check flags live in a shared MongoDB database (default name `platecheck`), not in PostgreSQL (ADR-0012). The registry is intentionally visible to all authenticated dealers, so it is **not** tenant-scoped. See [API integration](/docs/developers/api-integration) for its endpoints. Vehicle rows keep a `platecheckFlagged` boolean in Postgres, and the listing status `blocked_platecheck` makes the publish use-case refuse to publish that vehicle.

## Philippine geography (PSGC)

Regions, provinces, cities, and municipalities are **not** a database table. They come from the **PSGC** — the Philippine Standard Geographic Code, the PSA's official registry of administrative divisions, which assigns each one a stable 9-digit code.

The dataset is a committed build artifact at `dryvhub-api/src/core/data/psgc.generated.ts`: 17 regions, 81 provinces, 1,634 cities and municipalities. Regenerate it with `npm run psgc:sync`, which is the only thing that ever contacts the PSGC API. Nothing calls it at request time, so dealer onboarding does not depend on a third-party mirror staying up.

A dealer address stored in `tenant_locations` keeps both the canonical name and its code:

| Column | Holds |
| ------ | ----- |
| `region`, `province`, `city` | The PSGC spelling, rewritten on save. `Makati` is stored as `City of Makati` |
| `regionCode`, `provinceCode`, `cityCode` | The PSGC codes, derived server-side. Never accepted from a request body |
| `barangay` | Free text. Not validated (ADR-0014 explains why) |

Three things to know before working with this:

- **Validation is chain-scoped.** A city is only resolved inside an already-resolved province or region, because city names repeat — "Santa Cruz" names six different municipalities. Validating the fields independently would accept Cebu City in Region I.
- **Codes are nullable.** Rows written before ADR-0014 have none. The read path resolves them from the stored names, and the next write persists them, so do not assume a code is present on older data.
- **NCR has no provinces.** `Metro Manila` is accepted as an alias for the region and dropped from the province field rather than rejected. The retired `Region IV-B` maps to `MIMAROPA` the same way.

The portal gets this list from `GET /api/v1/geo/ph/regions`, `/provinces`, and `/cities` — see [API integration](/docs/developers/api-integration).

## Related pages

- [Auth and tenancy](/docs/developers/auth-and-tenancy)
- [Architecture](/docs/developers/architecture)
- [Decisions](/docs/developers/decisions)
- [Adding a feature](/docs/developers/adding-a-feature)
