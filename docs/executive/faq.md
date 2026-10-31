---
title: FAQ
sidebar_position: 9
description: Straight answers to the questions executives and board members ask most often about DryvHub.
---

# FAQ

:::tip[Key takeaways]
- Answers here come from the code and plans in the three repositories (November 2026). Where something is **not documented**, the answer says so.
- The questions that most often need a human decision are **how revenue is collected**, **who funds cashback**, and **who owns the outside accounts**.
:::

## The business

### What is DryvHub in one sentence?
A two-sided system for used-car sales in the Philippines: a **dealer app** that runs a dealership's inventory and money, and a **public Marketplace** where buyers browse verified cars, backed by one **shared backend**. See the [overview](/docs/executive/overview).

### How does DryvHub make money?
The code supports **paid monthly plans** (Free, Starter, Growth, Pro, Enterprise) and a **platform share of cashback**. However, plan prices shown in the app are fixed in the Dealer app's code and **no billing system collects them**, and the cashback funding model is not specified. Revenue is therefore **not documented as collected by the product**. See [Business model](/docs/executive/business-model).

### What does a dealer pay?
The Dealer app displays plan prices and limits, but they are display values in code, not contracts, and the upgrade button says checkout is not live. Real commercial terms are **not documented** in the repositories. See [Dealer billing](/docs/dealer/billing).

### What do buyers pay?
Nothing. Browsing, inquiring, and claiming cashback are free and need no account. See [Buyer journey](/docs/executive/buyer-journey).

### What is cashback and who pays for it?
A reward paid to the buyer after buying a car found through the Marketplace. The backend calculates it as a percentage of the **sold price**, using a rate frozen when the buyer sent the inquiry (platform defaults are set in platform settings). **Who funds it is not defined** in the code or docs: a dealer fee is recorded on each claim but not collected. The buyer site currently advertises a flat ₱2,000, which does not match the percentage math. See [Cashback](/docs/dealer/cashback) and [Cashback claims](/docs/marketplace/cashback-claims).

## Product status

### What works today?
The full dealer loop (signup, verification, inventory, publishing, inquiries, sales, financials, reports), the buyer browse-to-inquiry flow, and cashback claim, dealer response, admin review API, and manual payout. See [Product status](/docs/executive/product-status).

### What is missing?
Self-service billing, admin screens for cashback review and platform settings, staff invitations, an inquiry lifecycle, shared rate limiting, and any analytics or monitoring. Some admin screens call API routes we could not find. See [Product status](/docs/executive/product-status).

### Is there a mobile app?
No. Both web apps are websites. The Marketplace has a web manifest, but no native or store-listed app was found.

### Do buyers need an account?
No, by design. The inquiry code and the name on the dealer's sale record are the only identifiers. See [Buyer journey](/docs/executive/buyer-journey).

### Can dealers invite their staff?
Not yet. The data model has a staff role, but there is no invitation flow (deferred in ADR-0008). See [Product status](/docs/executive/product-status).

## Trust and safety

### How do we know a dealer is real?
A dealer submits a legal name, contact details, an address, and five documents (DTI, BIR, SEC, business permit, showroom photo). A **DryvHub admin reviews them by hand** and approves or rejects with a reason. We found no automatic check against government registries and no re-verification. See [Trust and safety](/docs/executive/trust-and-safety) and [Verification and access](/docs/dealer/verification-and-access).

### What stops a dealer from listing before approval?
One shared rule in the backend: public listing needs Stage 2 approved verification, a paid plan, and a valid subscription. It is checked again every time the public site reads listings. See [Marketplace eligibility](/docs/marketplace/eligibility).

### What is "Stage 3 verified"?
A label in the Dealer app for Stage 2. The data model has only Stage 1 and Stage 2. See the [glossary](/docs/start/glossary).

### Does PlateCheck block stolen or problem vehicles?
Not automatically. It is an advisory registry: dealers can search and report plates, but we found no code that blocks a dealer's own car. See [PlateCheck](/docs/dealer/platecheck) and [Trust and safety](/docs/executive/trust-and-safety).

### Can one dealer see another dealer's data?
By design no: the dealership is derived from the signed-in user and every dealer query is filtered by it. The weak point is that this relies on code discipline, with no database-level backstop. See [Auth and tenancy](/docs/developers/auth-and-tenancy) and [Risks and dependencies](/docs/executive/risks-and-dependencies).

### What private information can buyers see?
Only an allow-listed set of public car fields, the dealer's display name, and photos by signed link. They never see plate numbers, purchase prices, expenses, dealer notes, or internal documents. See [Buyer journey](/docs/executive/buyer-journey).

### How is cashback fraud handled?
Checks at claim time (code, name match, sale evidence, one claim per car), a timing flag for suspicious sequences, manual admin review, optional dealer confirmation or dispute, and **dealer strikes** (warning, then a 30-day suspension, then revocation). See [Trust and safety](/docs/executive/trust-and-safety).

## Operations and reporting

### How are cashback payouts made?
Manually. An admin sends a GCash or bank transfer and records the reference in the system. Automated payouts do not exist and no design for them has been written. The payment provider chosen in ADR-0011 (PayMongo) is for dealer subscriptions, not buyer payouts. See [Business model](/docs/executive/business-model).

### What numbers can leadership see?
Dealers see their own reports. Platform-level numbers require an engineer to query the database; there is no leadership dashboard and no web analytics. See [Metrics and reporting](/docs/executive/metrics-and-reporting).

### How long does dealer verification take?
Not specified anywhere. It is a manual process and no decision notification was found. See [Dealer journey](/docs/executive/dealer-journey).

### How do we handle a dealer or buyer who needs help?
We found no support process or runbook in the repositories. Admin screens exist for verification review, with a follow-up list (see [Admin portal](/docs/dealer/admin-portal)).

## Technology and risk

### What outside services do we rely on?
Supabase (sign-in), Resend (signup email), Facebook (posting, Messenger), S3-compatible storage (files), PostgreSQL (main data), MongoDB (PlateCheck), and, once built, PayMongo (subscription payments). See [Risks and dependencies](/docs/executive/risks-and-dependencies).

### What is the single biggest technical risk?
In the author's assessment: tenant isolation that depends on every query being filtered correctly, combined with a small team and no monitoring. See [Risks and dependencies](/docs/executive/risks-and-dependencies).

### What is the single biggest business risk?
Revenue and cashback that depend on manual steps and an undefined funding model, and a Marketplace promise (flat ₱2,000 cashback; PlateCheck protection) that is stronger than the product's enforcement. See [Risks and dependencies](/docs/executive/risks-and-dependencies).

### Where is the platform hosted?
Not documented in the repositories. The Dealer app's README mentions preview deployments on a hosting platform, but providers, accounts, and owners are not recorded. See [Architecture](/docs/developers/architecture).

### How do engineers get started?
Start with the [local setup](/docs/developers/local-setup) and [data model](/docs/developers/data-model). The decisions behind the design are in [Decisions](/docs/developers/decisions).

### Where do I learn the vocabulary?
See the [glossary](/docs/start/glossary) and [How it fits together](/docs/start/how-it-fits-together).

## Related pages

- [Overview](/docs/executive/overview)
- [Business model](/docs/executive/business-model)
- [Product status](/docs/executive/product-status)
- [Risks and dependencies](/docs/executive/risks-and-dependencies)
- [Welcome](/docs/start/welcome)
- [Marketplace overview](/docs/marketplace/overview)
- [Dealer overview](/docs/dealer/overview)
