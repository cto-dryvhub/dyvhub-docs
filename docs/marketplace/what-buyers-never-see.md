---
title: What buyers never see
sidebar_position: 8
description: The fields the public Marketplace contract includes, the private information it deliberately leaves out, and why.
---

# What buyers never see

This page lists exactly what the public Marketplace is allowed to show, what it is never allowed to show, and the reasons.

:::tip[In plain English]
The Marketplace is open to anyone on the internet. So the backend gives it a **short, fixed list of "safe" car fields**. Everything else a dealer stores (plate numbers, what they paid for the car, expenses, internal notes, paperwork, buyer records) never leaves the dealer's account. It is not hidden by a setting. The public data feed simply does not contain it.
:::

## Why the list is short on purpose

1. **Dealer protection.** Purchase price and margin are commercially sensitive. If competitors or buyers could see them, dealers would not use the platform.
2. **Fraud and privacy.** A plate number can be used to look up an owner or to make fake listings. Buyer and supply-agent records are personal data.
3. **One place for the rules.** The backend decides the public fields. The website only renders what it receives, so a front-end mistake cannot leak a field the API never sent.
4. **Safer defaults.** If a screen design needs a new field, the API must deliberately add it. It cannot slip in by accident.

## What the public contract includes

These fields are in the public listing (list and details):

| Field | Notes |
| --- | --- |
| Year, make, model, variant | Identity of the car. Variant is optional. |
| Price | The dealer's asking price. |
| Down payment (DP) | Optional. |
| Mileage, transmission, fuel type, color | Basic specs. |
| Body category | Sedan, SUV, and so on. |
| Featured flag | Decided by the backend from the dealer's plan. |
| Listed date | When the car was published. |
| Dealer display name and dealer subdomain | The public name of the dealership and the short name used for its public profile address. |
| Photos | Cover image and gallery, as time-limited secure links. |
| Documents-complete flag | The API sends a yes/no flag. The current website code does **not** display it. |
| Description (details only) | The details response also carries the dealer's written description. The current website does **not** display it (it builds its own overview text instead). |

## What is never exposed

| Private information | Why it stays private |
| --- | --- |
| **Plate number** | Privacy and fraud risk. Also used by PlateCheck inside DryvHub. |
| **Purchase price** and margins | Commercially sensitive. |
| **Expenses** (repairs, reconditioning, fees) | Commercially sensitive. |
| **Internal dealer notes** | Written for staff, not buyers. |
| **Internal documents** (OR/CR, deeds of sale, and so on) | Legal and personal data. |
| **Supply-agent data** | Personal and commercial data. |
| **Buyer data** (names, contact details from sales records) | Personal data. |
| **Sold price and sold date** | Private to the dealer, the buyer's claim and DryvHub admins. |
| **PlateCheck flags and reports** | Internal safety signals. A flagged car is just removed from public lists. |
| **Internal IDs of the dealership** (tenant ID) and billing, plan or verification details | Internal. The public sees only the display name and subdomain. |
| **Other private tenant information** | Each dealership's data is separated from every other dealership and from the public. |

:::note[One deliberate exception: the Messenger page]
When a buyer sends an inquiry, the API returns the dealer's Messenger page identifier so the site can open the chat. This is the public contact route the dealer has connected, not private data.
:::

## What about buyers' own information?

| Item | What happens |
| --- | --- |
| **Names typed in the Send Inquiry window** | Used only to write the Messenger message, which goes to the dealer. The website does not store them or send them to the API. See [Send Inquiry](/docs/marketplace/send-inquiry). |
| **Cashback claim details** (names, payout method, payout destination, evidence) | Sent to the DryvHub API and stored with the claim for DryvHub admin review. The public site never displays another buyer's claim. |
| **Theme and palette choice** | Saved in the buyer's own browser (local storage) so it is remembered. See [Theming and UI](/docs/marketplace/theming-and-ui). |
| **Most recent claim** | Saved in the buyer's browser tab only (session storage) and cleared when the tab closes. |
| **Analytics and tracking** | No analytics or tracking code was found in the repository. Whether any is added through hosting or a tag manager was not verified. |

## For developers

- If a mock-up needs a field the public contract does not have, treat it as an `dryvhub-api` change. Do not copy dealer-portal or admin shapes into the Marketplace.
- Public listing shape: `types/api/marketplace-listing.ts`. The data is parsed with zod at the service boundary (`services/marketplace-listings.service.ts`), which drops unknown fields.
- Backend selects only these columns for the public listing (`PUBLIC_LISTING_SELECT` and `PUBLIC_LISTING_DETAIL_SELECT` in `marketplace-listing.data-service.ts`). Response DTO: `public-marketplace-listing-detail-response.dto.ts`.
- Tenant identity on authenticated routes comes from the signed-in user, never from the request. Public Marketplace routes have no tenant context at all.
- Never log or store secrets or full personal data. Never copy `.env*` values into docs or code.

## Related pages

- [Marketplace overview](/docs/marketplace/overview)
- [Vehicle details](/docs/marketplace/vehicle-details)
- [Eligibility](/docs/marketplace/eligibility)
- [Trust and safety](/docs/executive/trust-and-safety)
- [Data model](/docs/developers/data-model)
- [Dealer PlateCheck](/docs/dealer/platecheck)
