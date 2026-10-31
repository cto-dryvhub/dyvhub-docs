---
title: For-dealers page
sidebar_position: 9
description: The /for-dealers landing page on the Marketplace, why it exists, each section in order, which parts use live data, and where its sign-up buttons lead.
---

# For-dealers page

This page describes the `/for-dealers` landing page: its purpose, each section from top to bottom, and where the numbers and links come from.

:::tip[In plain English]
`/for-dealers` is a **sales page for car dealers**, not for buyers. It sits on the public Marketplace site and invites dealers to sign up. It explains the benefits, shows real listings as proof, and points to the Dealer app for sign-up. A dealer who signs up and gets verified has their eligible cars appear on the Marketplace automatically.
:::

## Purpose

- **Grow supply.** More verified dealers means more cars for buyers.
- **Use the Marketplace itself as the proof.** The page shows live listings and live counts from the same public feed buyers use.
- **Stay honest.** The page copy follows a written rule in the code: every claim must be provable from the website or the public API. It does not state prices, fees, commissions, contract terms, eligibility rules or invented testimonials.

It is reachable from the **For Dealers** link in the site menu and footer, and it appears in the sitemap. See [SEO and sharing](/docs/marketplace/seo-and-sharing).

## Sections, top to bottom

| # | Section | What it says or shows | Data |
| --- | --- | --- | --- |
| 1 | **Hero** | Eyebrow "For used-car dealers in the Philippines", headline "List once. Sell sooner.", a short pitch, and a four-step strip: Verified Dealer, DryvHub Marketplace, Buyer Search, Direct Inquiry. Two buttons: **SIGN UP to list your stock** and **See what buyers see**. | Fixed text |
| 2 | **Live demand** | "Buyers are already browsing this inventory." Up to three numbers: **Live listings**, **Verified dealers**, **Brands covered**. | Live, from the public listings feed at page load |
| 3 | **Showcase** | "This is exactly what a buyer sees." Three real listing cards, with a link to the full inventory. | Live. Uses featured cars if there are at least three; otherwise the newest cars. |
| 4 | **Advantages** | Four benefits: inquiries arrive as real Messenger conversations; no buyer sign-up; units are presented properly; listings are found by search engines. | Fixed text |
| 5 | **How it works** | Four steps: get verified, keep managing stock in the Dealer app, eligible units publish themselves, close the sale on Messenger. | Fixed text |
| 6 | **Your data** | Two lists: what buyers see (year, make, model, variant, asking price, mileage, transmission, fuel, color, category, dealership name, photos) and what never leaves the dealer's account (plate number, purchase price and margin, expenses, internal notes, documents, supply-agent and buyer records). | Fixed text |
| 7 | **FAQ** | Six questions: re-uploading inventory, which units appear, how inquiries reach the dealer, whether buyers need an account, whether private data is visible, who controls photos. | Fixed text, also published as structured data |
| 8 | **Closing call to action** | "Put your best units in front of buyers this week", a sign-up button, and "Already a DryvHub dealer? Sign in". | Fixed text |

### About the live numbers

- The numbers are counted from the newest public listings (up to 100 are sampled). The **listing count** uses the API's total, so it is not capped at 100. The **dealer** and **brand** counts reflect only the sampled listings.
- A number is shown only if it is **2 or higher**. A "1" can look like a warning rather than proof, so it is hidden. If no number qualifies, or the API cannot be reached, the whole section is hidden. The page never shows invented numbers.
- If the API is down, the page still loads without the demand and showcase data.

## Where the buttons lead

| Button | Destination |
| --- | --- |
| **SIGN UP to list your stock** (hero and closing band) | The Dealer app's sign-up page (`/dealer/signup` on the DryvHub app address). |
| **Sign in** (closing band) | The Dealer app's sign-in page (`/dealer/login`). |
| **See what buyers see** and showcase links | The public inventory at `/vehicles`. |

The Dealer app address is written directly into the Marketplace code, not read from an environment setting.

:::note
What happens after sign-up (verification, plans, publishing) lives in the Dealer app. See [Dealer overview](/docs/dealer/overview), [Verification and access](/docs/dealer/verification-and-access) and [Listings and publishing](/docs/dealer/listings-and-publishing).
:::

## For developers

- Route: `app/for-dealers/page.tsx`. All copy: `components/marketplace/dealers/dealer-content.ts`. Sections: `dealer-hero.tsx`, `dealer-demand.tsx`, `dealer-showcase.tsx`, `dealer-advantages.tsx`, `dealer-steps.tsx`, `dealer-privacy.tsx`, `dealer-faq.tsx`, `dealer-cta-band.tsx`.
- Data: one call to the listings service (`take` 100, newest first), with counts from `deriveMarketplaceReach` in `lib/marketplace/listing-display.ts`. Errors are logged and the page renders with empty data.
- SEO: dedicated title and description, canonical `/for-dealers`, and `FAQPage` structured data built from the same FAQ list.
- Sign-up and sign-in URLs: `dealerSignupUrl()` and `dealerSignInUrl()` in `lib/marketplace/site-url.ts`.
- The page-planning note for this feature is `docs/plans/dealer-acquisition-landing.md` in the Marketplace repository.

## Related pages

- [Marketplace overview](/docs/marketplace/overview)
- [What buyers never see](/docs/marketplace/what-buyers-never-see)
- [Eligibility](/docs/marketplace/eligibility)
- [Dealer overview](/docs/dealer/overview)
- [Dealer verification and access](/docs/dealer/verification-and-access)
