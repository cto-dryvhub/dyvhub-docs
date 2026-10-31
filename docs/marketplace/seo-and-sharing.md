---
title: SEO and sharing
sidebar_position: 10
description: How the Marketplace presents itself to search engines and social apps, including page titles, structured data, the sitemap, robots rules, canonical addresses and link sharing.
---

# SEO and sharing

This page explains how Marketplace pages show up in Google and in link previews (Facebook, Messenger and similar), and how to share links reliably.

:::tip[In plain English]
**SEO** (search engine optimization) means helping Google understand and list our pages. Every car has its own page with a clear title, description and photo, so it can appear in search results and look good when pasted into a chat. Search engines are told which pages to list, and which version of a page is the "official" one. When you share a link, share the car's own page.
:::

The official site name in titles and previews is **Marketplace by DryvHub**.

## What each page tells search engines

| Page | Title | Indexed? | Canonical (official) address |
| --- | --- | --- | --- |
| `/` | Marketplace by DryvHub | Yes | The site origin |
| `/vehicles` | "Verified used cars" | Yes | `/vehicles` **without** filters or page numbers |
| `/vehicles/{id}` (car found) | Year, make, model and variant (for example "2019 Toyota Vios 1.3 E") | Yes | `/vehicles/{id}` |
| `/vehicles/{id}` (car missing) | "Vehicle listing" (generic) | **No** ("noindex, follow") | None |
| `/for-dealers` | "Sell with DryvHub: list your dealership stock" | Yes | `/for-dealers` |
| `/purchases/cashback` | Cashback page | **No** ("noindex, nofollow") | None |

Titles use the pattern "page title | Marketplace by DryvHub" where the layout adds the site name.

### What a car page says about itself

- **Description**: a sentence made from the car's year, make, model, asking price, dealer name, mileage, transmission and fuel type.
- **Open Graph and Twitter card**: the data social apps use for link previews. The card type is "summary large image". The picture is the car's **cover photo**, only if it is a full web address. If there is no cover photo, no picture is attached.
- **Structured data (JSON-LD)**: a small hidden block that tells search engines the page is a `Vehicle` with name, brand, model, year, mileage and an `Offer` (price in PHP, availability "InStock").
- **Locale**: `en_PH` (English, Philippines).

The structured data and previews contain **only public fields**. See [What buyers never see](/docs/marketplace/what-buyers-never-see).

:::note[Why the price in the structured data looks different]
On screen, prices are rounded to whole pesos. The structured data carries the number as stored (with decimals if any).
:::

### `/for-dealers` structured data

The dealer landing page includes `FAQPage` structured data built from its six FAQ questions. See [For-dealers page](/docs/marketplace/for-dealers-page).

## Sitemap and robots

| File | What it does |
| --- | --- |
| `/sitemap.xml` | Lists the home page, `/vehicles`, `/for-dealers`, and each current public car page. Cars include their listed date as "last modified" when known. |
| `/robots.txt` | Allows all crawlers on all paths and points to the sitemap. |

Details worth knowing:

- The sitemap lists only the **newest 100** public cars (the API's maximum for one request). Older cars still have working pages but are not listed in the sitemap.
- Only **available** cars are listed. "Coming soon" cars are not in the sitemap.
- Filtered inventory addresses (for example `?make=Toyota`) are **not** in the sitemap, and the canonical address strips filters, so Google treats them as the same page as `/vehicles`.
- If the API is unreachable when the sitemap is built, the sitemap contains only the three fixed pages.

## Canonical addresses and the site origin

All "official" addresses are built from one setting, the site's public web address (`NEXT_PUBLIC_SITE_URL`). If it is not set, the code falls back to a local development address.

:::warning
If the production site address is not configured correctly, canonical links, link previews and the sitemap will point to the wrong place. Whether it is set correctly in production was **not verified** here. A quick check: open a car page, view the page source, and look at the canonical link.
:::

## Sharing links: a guide for support

| You want to share | Share this | Notes |
| --- | --- | --- |
| One specific car | `https://{site}/vehicles/{id}` | Gives a rich preview with the car's photo, title and price. Copy it from the browser or use the **Share** button. |
| A filtered search | The full `/vehicles?...` address | Works for the person you send it to. Search engines ignore the filters. See [Browsing and search](/docs/marketplace/browsing-and-search). |
| A car and open the inquiry window right away | `/vehicles/{id}?inquire=1` | Starts the inquiry once and removes the parameter. Use carefully, because it creates an inquiry for whoever opens the link. |
| The cashback page | `/purchases/cashback` | Add `?inquiryCode=...` to pre-fill the code. |

Notes:

1. The **Share** button on a car uses the phone's built-in share feature. On many desktop browsers it does nothing. Copy the address instead.
2. **Messenger link in an inquiry.** The message that a buyer sends to the dealer contains a link to the car. The backend builds that link from its own public-origin setting. It must match the real Marketplace address. Whether production has this set correctly was **not verified**. See [Send Inquiry](/docs/marketplace/send-inquiry).
3. **Photos in previews are time-limited.** The preview picture is the car's cover photo link, which expires after a while. Apps that cache a preview may keep the picture; apps that re-fetch later may show no picture. This follows from how the photo links work. It is an inference and was not tested.
4. **Installable app details.** The site publishes a web app manifest (`/manifest.webmanifest`): name "Marketplace by DryvHub", short name "DryvHub", full-screen display, dark navy background and theme color, English (Philippines).

## For developers

- Metadata builders and structured data: `lib/marketplace/seo.ts`. Site origin helpers: `lib/marketplace/site-url.ts`. Pages call `generateMetadata` (details) or export `metadata` (home, inventory, dealers).
- Sitemap: `app/sitemap.ts` (uses the default listings request, so the API's default page size applies). Robots: `app/robots.ts`. Manifest: `app/manifest.ts`.
- Structured data is serialized with `<` escaped (`jsonLdScriptContents`) to avoid breaking out of the script tag.
- The cashback page sets `robots: { index: false, follow: false }`.
- Planning note: `docs/plans/marketplace-seo-metadata.md` in the Marketplace repository.

## Related pages

- [Vehicle details](/docs/marketplace/vehicle-details)
- [Browsing and search](/docs/marketplace/browsing-and-search)
- [For-dealers page](/docs/marketplace/for-dealers-page)
- [Troubleshooting and FAQ](/docs/marketplace/troubleshooting-faq)
- [API integration](/docs/developers/api-integration)
