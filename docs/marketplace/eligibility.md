---
title: Eligibility
sidebar_position: 7
description: The seven backend rules that decide whether a car appears on the Marketplace, explained in plain language, with a checklist and a "why isn't my car showing" table for support.
---

# Eligibility

This page explains which cars appear on the Marketplace and why. It includes a checklist and a lookup table that support staff can use when a dealer asks, "Why isn't my car showing?"

:::tip[In plain English]
A car appears on the Marketplace only when **seven conditions are all true at the same time**: the dealer is verified and paying, the car is published and still for sale, and nothing has flagged it. If any one fails, the car silently disappears from the public site. The website never makes this decision itself; it shows whatever the DryvHub backend returns.
:::

## The seven rules

The architecture document for the Marketplace lists seven rules. They are enforced **only in the backend** (`dryvhub-api`). The table explains each one and shows how the code checks it today.

| # | Rule | Plain-language meaning | How the backend checks it |
| --- | --- | --- | --- |
| 1 | **Dealer is on an eligible paid plan** | The dealership pays for DryvHub, or is in a trial. Free or lapsed accounts are not shown. | Plan is one of `starter`, `growth`, `pro`, `enterprise`, and subscription status is `trialing`, `active`, or `past_due`. |
| 2 | **Stage 2 verification approved** | DryvHub has checked the dealership's identity and documents (the second, deeper verification stage). | Verification stage is `stage_2` and verification status is `approved`. |
| 3 | **Dealership is active** | The account has not been switched off. | Tenant `isActive` is true. |
| 4 | **Car is in an eligible state** | The car is "available" (for sale now) or, for the Coming soon tab and direct links, "coming". | Vehicle status is `available` (default list, home, sitemap) or `coming` (Coming soon tab, details, inquiry). |
| 5 | **Listing is published** | The dealer has pressed **Publish** for this car. | Vehicle listing status is `published`. |
| 6 | **PlateCheck has not blocked it** | The plate was not flagged by DryvHub's plate-safety check. | `platecheckFlagged` is false. |
| 7 | **Not sold, not archived** | Sold or archived cars leave the Marketplace. | `soldAt` is empty and `archivedAt` is empty. |

:::note
"Past due" still counts as eligible in the current code, so a dealer who just missed a payment can stay visible for a while. See [Dealer verification and access](/docs/dealer/verification-and-access) for how plans and verification are managed, and [Dealer listings and publishing](/docs/dealer/listings-and-publishing) for how a dealer publishes a car.
:::

If a rule fails, the car is left out of the public **list, search, home page, details and inquiry**. A direct link to it shows [Listing unavailable](/docs/marketplace/vehicle-details). The public site never returns a private dealer record, even for an ineligible car.

### Not part of the check

These do **not** decide whether a car is public (according to the backend query):

- Number of photos (a car with no photos can still be listed; the page says "No photos available").
- Whether the car's documents are complete.
- Whether the dealer has set up Messenger. A car without Messenger still shows, but **Send Inquiry** fails with "This dealer isn't set up for Messenger inquiries yet."
- The car's external-sync status (for example Facebook sync).

### Featured cars

A car is shown as **featured** only when the dealer's plan is one of the higher plans (`pro` or `enterprise`, as defined by the backend's featured-eligible plan list) **and** the dealer flagged the car as featured. This is decided by the backend. See [Browsing and search](/docs/marketplace/browsing-and-search).

## Checklist for support

Work from top to bottom. The first "no" is usually the reason.

- [ ] The dealership account is active.
- [ ] Verification is **Stage 2** and **approved**.
- [ ] The plan is paid or in trial, and the subscription is trialing, active, or past due.
- [ ] The car is in the **available** state (or **coming** if looking at the Coming soon tab).
- [ ] The car's listing is **published** (not draft or unpublished).
- [ ] The car is **not sold** and **not archived**.
- [ ] PlateCheck has **not flagged** the plate.
- [ ] The buyer is looking in the right place: **All vehicles** for available cars, **Coming soon** for coming cars, with no filters hiding it.

## "Why isn't my car showing?"

| What support sees | Likely cause | What to check or do |
| --- | --- | --- |
| Car is in the Dealer app but not on `/vehicles` | Listing not published | Open the car in the Dealer app and check the listing status. See [Dealer listings and publishing](/docs/dealer/listings-and-publishing). |
| Car was visible and then vanished | It was marked sold, archived, unpublished, or flagged by PlateCheck | Check the sale record and the PlateCheck flag. See [PlateCheck](/docs/dealer/platecheck). |
| **None** of a dealer's cars show | Dealer fails rule 1, 2, or 3 | Check verification stage and status, plan, subscription and whether the account is active. See [Dealer verification and access](/docs/dealer/verification-and-access). |
| Car shows only on the **Coming soon** tab | Its status is "coming", not "available" | Change the car's status in the Dealer app when it is ready for sale. |
| Car appears on its direct link but not in the list | It is "coming" (details accept coming, the default list does not) | Same as above. |
| Car shows, but **Send Inquiry** says the dealer isn't set up | Messenger is not configured | The dealer needs to connect their Facebook page in the Dealer app. |
| Car shows, but no photos | No photos uploaded | Dealer adds photos in the Dealer app. |
| Car is not featured | Plan is not a featured plan, or the car is not flagged featured | Check the plan and the flag. |
| Changes dealers made are not visible yet | Page is showing older data, or a failed load | Reload. Home and lists load fresh data from the API on each request. |
| Dealer says "it's published but still missing" | One of the seven rules fails that the dealer cannot see | Walk through the checklist above. If everything passes, ask a developer to query the car's public eligibility fields. |

## Cashback eligibility is separate

Whether a car is on the Marketplace and whether a buyer can claim cashback are **different checks**. Cashback depends on an inquiry, a recorded sale, and the dealer's cashback standing. See [Cashback claims](/docs/marketplace/cashback-claims).

:::note[Wording difference]
The Marketplace architecture document says cashback is "not eligible" if the inquiry was created after the sold date. In the current backend code, such a claim is accepted but flagged for **manual timing review** (shown to buyers as "On hold for review"). This documentation follows the code.
:::

## For developers

- Query: `PUBLIC_LISTING_SHARED_ELIGIBILITY`, `PUBLIC_LISTING_ELIGIBILITY` and `PUBLIC_LISTING_DETAIL_ELIGIBILITY` in `src/services/data-services/marketplace-listing.data-service.ts`. Constants for plans and subscription statuses come from the core entities.
- List and sitemap use status `available` by default. Details and inquiry accept `available` and `coming`.
- The website must never re-implement this list. If a car is missing from the API, it is not on the site. The website also never caches a car as eligible after the API says it is gone.
- Endpoints: `GET /api/v1/marketplace/listings`, `GET /api/v1/marketplace/listings/:vehicleId`. Swagger is authoritative.
- Dealers use `POST /api/v1/vehicles/:id/listing/publish` and `.../unpublish` in the Dealer app flow. See [Architecture](/docs/developers/architecture).

## Related pages

- [Browsing and search](/docs/marketplace/browsing-and-search)
- [Vehicle details](/docs/marketplace/vehicle-details)
- [Troubleshooting and FAQ](/docs/marketplace/troubleshooting-faq)
- [Dealer verification and access](/docs/dealer/verification-and-access)
- [Dealer listings and publishing](/docs/dealer/listings-and-publishing)
- [Trust and safety](/docs/executive/trust-and-safety)
