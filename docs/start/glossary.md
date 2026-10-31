---
title: Glossary
sidebar_position: 3
description: Plain-English definitions of DryvHub terms, in alphabetical order, with where each one shows up.
---

# Glossary

Every term is explained in one plain sentence, followed by where you will meet it. Terms are alphabetical. If a word here is unfamiliar, search the site for it using the search box.

:::tip How to read the "Where it appears" column
Page names in plain text are screens in the Dealer app or Marketplace. Names in backticks are technical identifiers (a database field or status value) that you may see in support tickets, reports, or error messages.
:::

| Term | What it means | Where it appears |
| --- | --- | --- |
| **Admin portal** | The set of screens used by DryvHub staff (not dealers) to review dealers and manage cars across all dealerships. | Dealer app, on the admin address; [Admin portal](/docs/dealer/admin-portal) |
| **Age band** | A label (`fresh`, `good`, `exit`) showing how long a car has been in stock, used to spot slow movers. | Inventory filters, reports |
| **API** | The backend service all apps talk to; it holds the business rules and the database connection. | Everywhere; [Architecture](/docs/developers/architecture) |
| **Approved (verification)** | The result when a DryvHub admin accepts a dealer's documents; it moves the dealer to Stage 2. | Verification page, admin portal |
| **Archived vehicle** | A car hidden from normal lists (it has an archive date) but kept for records; it cannot be published. | Inventory |
| **Audit log** | A permanent record of sensitive admin actions: who did what, to which record, and when. | Verification decisions, cashback reviews; [Trust and safety](/docs/executive/trust-and-safety) |
| **Available (vehicle status)** | A car that is in stock and for sale; one of the statuses a car can have. | Inventory, Marketplace |
| **Bearer token** | The digital pass the browser attaches to each request to prove who you are; it comes from Supabase after sign-in. | Every signed-in request; [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Bump (Facebook)** | Re-posting a listing to Facebook so it appears fresh again. | Listings page |
| **Business permit / DTI / SEC / BIR** | The Philippine business registrations a dealer must upload to be verified. | Onboarding checklist |
| **Buyer name match** | The rule that the name on a cashback claim must match the buyer name the dealer recorded on the sale. | Cashback claim; [Eligibility](/docs/marketplace/eligibility) |
| **Cashback** | A payout to a buyer after a verified purchase that began on the Marketplace. | Marketplace cashback page; [Cashback](/docs/dealer/cashback) |
| **Cashback eligibility (dealer)** | A dealer-level switch (`eligible`, `suspended`, `revoked`) controlling whether that dealer's sales can earn cashback. | Dealer cashback page; strikes |
| **Claim** | A buyer's request for cashback, tied to one inquiry code and one sold car. | Marketplace cashback page, dealer cashback list, admin queue |
| **Clean Architecture** | The code layout rule that business logic sits in the middle and never depends on web or database details. | [Architecture](/docs/developers/architecture) |
| **Coming soon (vehicle status)** | A car shown on the Marketplace's Coming Soon tab before it is ready to sell. | Marketplace inventory tab |
| **Cover image** | The main photo shown on a listing card; it is a time-limited link, not a permanent address. | Marketplace |
| **Dealer** | A used-car business using DryvHub; technically a **tenant**. | Everywhere |
| **Dealer fee (platform setting)** | A percentage of the sale price recorded on each cashback claim as the dealer's fee; defaults to 0 percent and no code bills it today. | Platform settings; [Business model](/docs/executive/business-model) |
| **Dealer strike** | A recorded penalty against a dealer after an admin confirms fraud on a cashback claim. | Admin review; [Trust and safety](/docs/executive/trust-and-safety) |
| **Dealer verification (Stage 1 / Stage 2)** | DryvHub's review of a dealer's identity and documents. Stage 1 means "submitted and under review"; Stage 2 means "approved". | Verification page; [Verification and access](/docs/dealer/verification-and-access) |
| **Dispute (cashback)** | A dealer's response saying a claim is wrong (for example the buyer did not buy the car). | Dealer cashback detail |
| **Draft (listing status)** | A car that exists in inventory but is not published. | Listings page |
| **DTO** | "Data transfer object": the exact shape of data the API sends or accepts, which controls what is exposed. | API code; [Data model](/docs/developers/data-model) |
| **Eligibility (Marketplace)** | The set of checks a car and its dealer must pass before the public can see the car. | [Eligibility](/docs/marketplace/eligibility) |
| **Evidence** | Proof attached to a cashback claim, such as notes, a link, or an uploaded document. | Cashback claim |
| **Featured listing** | A car highlighted on the Marketplace; allowed only on Pro and Enterprise plans. | Listings; billing page |
| **Financial transaction** | A recorded money movement (sale payment, expense, and so on) in the dealer's books. | Financials pages |
| **Fraud review** | A cashback claim status meaning the claim is under deeper investigation. | Admin queue |
| **GCash** | A Philippine mobile wallet; one of the two payout methods for cashback, with bank transfer. | Cashback claim form |
| **Held / blocked listing** | Listing statuses (`held`, `blocked_platecheck`) that stop a car from being published. | Listings; [PlateCheck](/docs/dealer/platecheck) |
| **Inquiry** | A buyer's recorded interest in a specific car; created when they press Send Inquiry. | Marketplace; dealer Inquiries page; [Inquiries](/docs/dealer/inquiries) |
| **Inquiry code** | A short unique code on each inquiry; the buyer uses it later to claim cashback. | Messenger message; cashback claim |
| **JWT / JWKS** | The signed sign-in token and the public key list the API uses to check the signature without calling Supabase each time. | [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Legacy import** | A way for a dealer to bring in old sales and cost records from before they used DryvHub. | Financials Summary |
| **Listing** | A car that a dealer has made visible to buyers. | Listings page; Marketplace |
| **Listing status** | Where a car is in the publishing process: `draft`, `pending_review`, `published`, `held`, `blocked_platecheck`. | Listings page |
| **Locked rate** | The cashback percentage frozen on an inquiry at the moment it is created, so later setting changes do not reprice it. | Inquiry; cashback claim |
| **Marketplace** | The public, no-login website where buyers browse eligible cars. | [Marketplace overview](/docs/marketplace/overview) |
| **Messenger** | Facebook's chat app; where buyers and dealers talk after an inquiry. | Marketplace inquiry flow |
| **Migration** | A versioned change to the database structure; applied by tooling, never edited by hand. | [Local setup](/docs/developers/local-setup) |
| **MinIO** | A self-hosted, S3-compatible file store used as a local stand-in for cloud storage. | [Local setup](/docs/developers/local-setup) |
| **MongoDB** | The second database, used only for PlateCheck flags. | PlateCheck |
| **Monthly overhead** | Recurring dealership costs (rent, utilities, salaries) entered monthly so net profit is accurate. | Financials, Overhead |
| **Multi-tenant** | One platform serving many separate dealerships whose data must never mix. | [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Needs evidence** | A cashback status where the admin asked the buyer for more proof. | Marketplace cashback page |
| **Onboarding** | The checklist a new dealer completes (business details, documents, photos) to apply for verification. | Onboarding checklist; [Getting started](/docs/dealer/getting-started) |
| **OR/CR** | Official Receipt and Certificate of Registration: the Philippine vehicle ownership papers. Optional for onboarding; attachable per car. | Vehicle documents |
| **Past due (subscription status)** | A paid plan whose payment is late; the code still treats it as valid for Marketplace access. | Billing page |
| **PayMongo** | The Philippine payment provider chosen for dealer subscription billing; not yet integrated in code. | [Billing](/docs/dealer/billing) |
| **Payout** | The actual sending of cashback money to the buyer; recorded manually by an admin. | Admin cashback; [Cashback claims](/docs/marketplace/cashback-claims) |
| **Plan (subscription plan)** | A dealer's tier: Free, Starter, Growth, Pro, or Enterprise. Sets capacity and Marketplace access. | Billing page; [Billing](/docs/dealer/billing) |
| **Platform admin** | A DryvHub employee account with cross-dealer powers; separate from dealer users. | Admin portal |
| **Platform settings** | A single record controlling cashback percent, dealer fee, platform revenue share, and promotions. | Admin API; [Business model](/docs/executive/business-model) |
| **PlateCheck** | A shared registry where dealers search and report problem license plates. | PlateCheck page; [PlateCheck](/docs/dealer/platecheck) |
| **Plate flag** | One report in PlateCheck: a plate plus a reason category and optional evidence photo. | PlateCheck |
| **Presigned URL** | A temporary web link that allows one specific upload or download from private storage. | Photo and document uploads |
| **Prisma** | The tool the API uses to read and write the PostgreSQL database. | [Data model](/docs/developers/data-model) |
| **Promo (cashback)** | A time-limited cashback rate that overrides the normal rate while active. | Platform settings |
| **Publish** | Making a car visible on the Marketplace (and attempting a Facebook post). | Listings page; [Listings and publishing](/docs/dealer/listings-and-publishing) |
| **React Query (TanStack Query)** | The library the apps use to fetch and cache server data. | Developer docs |
| **Record sale** | The dealer action that marks a car sold and writes the money entries. | Vehicle detail; [Inventory](/docs/dealer/inventory) |
| **Resend** | The email service used to send signup codes. | Signup |
| **RSC (React Server Component)** | A page rendered on the server before it reaches the browser, which keeps pages fast. | Developer docs |
| **S3** | Amazon-style file storage holding photos and documents in a private bucket. | Uploads |
| **Showroom photo** | A required onboarding image of the dealer's physical location. | Onboarding checklist |
| **Sold price** | The final recorded price of a sale; the base for cashback math. | Sales reports; cashback |
| **Staging / main** | The two long-lived code branches: staging for testing, main for production. | Developer docs |
| **Storage quota** | How much photo and document space a plan allows (for example 500 MB on Free). | Storage page |
| **Subdomain** | A dealership's own web address prefix, such as `dealership-name.dryvhub.com`. | Dealer app; [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Subscription status** | The billing health of a dealer: `trialing`, `active`, `past_due`, `suspended`, `canceled`. | Billing page |
| **Supabase** | The outside service that manages sign-in and passwords. | [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Swagger** | An interactive page listing every API endpoint, used by developers. | Developer docs |
| **Sync (to Marketplace / Facebook)** | A manual or automatic action that pushes a published car to a destination and records success or failure. | Listings page |
| **Tenant** | One dealership's private workspace and all its data. | Everywhere |
| **Tenant user** | A person's membership in a dealership (owner or staff). | Settings; [Auth and tenancy](/docs/developers/auth-and-tenancy) |
| **Timing review** | A flag on a cashback claim when the inquiry was created at or after the sale time; it needs a human look. | Admin queue |
| **Trialing** | The default subscription status for new dealers; no trial timer logic was found in the code. | Billing page |
| **UTC** | The universal time standard used for every timestamp the platform stores. | Reports, audit |
| **Vehicle status** | The stock state of a car: `draft`, `active`, `available`, `coming`, `reserved`, `sold`, `archived`. | Inventory |
| **Webhook** | An automatic message from an outside service to DryvHub; planned for PayMongo billing events, not built. | [Billing](/docs/dealer/billing) |

:::note "Stage 3 verified" is a label, not a third stage
The database has two real stages (`stage_1` and `stage_2`). The Dealer app shows a **"Stage 3 verified"** badge to dealers who have reached Stage 2. This naming is confusing and is called out in [Dealer journey](/docs/executive/dealer-journey).
:::

## Related pages

- [Welcome](/docs/start/welcome)
- [How it fits together](/docs/start/how-it-fits-together)
- [Executive overview](/docs/executive/overview)
- [Dealer app overview](/docs/dealer/overview)
- [Marketplace overview](/docs/marketplace/overview)
- [Data model](/docs/developers/data-model)
