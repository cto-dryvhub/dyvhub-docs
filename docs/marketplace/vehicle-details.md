---
title: Vehicle details
sidebar_position: 4
description: What the vehicle details page shows (gallery, price, specs, dealer), what each field means, and what happens when a listing is no longer available.
---

# Vehicle details

This page explains every part of the vehicle details page (`/vehicles/{id}`), what each field means, and what buyers see when a car is gone.

:::tip[In plain English]
The details page is the "showroom" page for one car. It has a photo gallery, the asking price, the main specs, the dealer's name, and the **Send Inquiry** button. If the car has been sold, hidden or removed, buyers see a polite "Listing unavailable" page instead.
:::

## What is on the page

| Area | What the buyer sees |
| --- | --- |
| **Back to cars** | A link to the inventory list. |
| **Photo gallery** | A large photo, a counter such as "1 / 5", previous and next arrows, and a row of thumbnails. |
| **Category badge and vehicle ID** | A small label such as "SUV" and the car's internal listing ID (useful when talking to support). |
| **Share button** | Opens the phone's share sheet. See the note below. |
| **Title** | Year, make, model, and the variant (for example "2019 Toyota Vios 1.3 E"). If the dealer left the variant blank, the transmission is used instead. |
| **Price and DP** | The asking price, and **DP** (down payment) when the dealer entered one. A dash means no down payment was provided. |
| **Dealer name** | The dealership's public display name. It links to the dealer's public profile in the DryvHub app and opens in a new tab. |
| **Quick facts strip** | Mileage, transmission, fuel type. |
| **Send Inquiry** | Starts the inquiry. See [Send Inquiry](/docs/marketplace/send-inquiry). |
| **Overview** | A short paragraph. See the warning below. |
| **Specifications** | A table with every public field. |

### The photo gallery

- Tap or click the main photo, or the **Enlarge** label, to open a full-screen view.
- In the full-screen view, left and right arrow keys (and the arrow buttons) move between photos; there is a **Close** button.
- Photos are ordered with the **primary** photo first, then by the dealer's chosen order.
- If the dealer has no photos, the box says "No photos available."
- Photos are served through **time-limited secure links** (see "Why photos can stop loading" below).

:::note[The Overview is written by the website]
The Overview paragraph is **not** the dealer's own description. The website builds it automatically from the car's body type, color, mileage, transmission and fuel type, then adds a generic line and "Send an inquiry to see it up close." The API's details response does include the dealer's written description, but the current website does not display it.
:::

:::note[Share button]
The share button uses the device's built-in "share" feature. On browsers that do not offer it (many desktop browsers), pressing it does nothing. Users can copy the address from the browser bar instead.
:::

## What each field means

| Field | Meaning |
| --- | --- |
| **Year / Make / Model / Variant** | Basic identity of the car. Variant is the trim or edition, if the dealer entered one. |
| **Category** | Body type: sedan, crossover, SUV, pickup (shown as "Trucks" in filters), van, or hatchback. |
| **Color** | The car's color as entered by the dealer. |
| **Mileage** | Kilometers on the odometer, shown with a plus sign (for example `12,400+ km`). |
| **Transmission** | Manual, automatic or CVT (a continuously variable automatic). |
| **Fuel type** | Gasoline, diesel, hybrid or electric. |
| **Price** | The dealer's **asking price** in pesos, rounded to whole pesos on screen. |
| **DP** | Down payment, if the dealer provided one. |
| **Dealer** | The dealership's public name (the dealer's public display name, or their business name if none is set). |
| **Vehicle ID** | The car's unique identifier in DryvHub. |

Fields that are intentionally missing (plate number, purchase cost and more) are listed in [What buyers never see](/docs/marketplace/what-buyers-never-see).

:::warning[Price is an asking price]
The price shown is what the dealer has entered in the Dealer app. DryvHub does not negotiate or guarantee it. If a dealer changes the price, the page shows the new price the next time it loads.
:::

## When a car is gone (not found or unavailable)

If the API does not return the car, the page shows:

> **Listing unavailable**
> This vehicle is no longer on the marketplace or the listing could not be loaded. Browse current inventory to find another match.

with a **Back to cars** button.

Common reasons:

1. The car was **sold**, archived, unpublished or marked reserved or draft by the dealer.
2. The dealer's account no longer meets the rules (for example its subscription lapsed or verification changed).
3. The car was flagged by a PlateCheck review.
4. The link was mistyped.
5. The API was temporarily unreachable. The page cannot tell "not found" apart from "could not load," which is why the message mentions both.

See [Eligibility](/docs/marketplace/eligibility) for the full rules. For search engines, a missing car page is marked "do not index" so it drops out of search results over time. See [SEO and sharing](/docs/marketplace/seo-and-sharing).

:::note[Coming soon cars]
A car marked **coming soon** is hidden from the default list but can still be opened with its direct link. The details page does not currently show a "Coming soon" label, and **Send Inquiry** works the same.
:::

## Why photos can stop loading

Photos use presigned links, which are web addresses that stop working after a short time on purpose, so private storage stays private. The API tells the website how long each link lasts. If a buyer leaves the page open for a long time and then clicks around, photos may fail to show. **Reloading the page fetches fresh links.** The exact lifetime is set by the API and is not published here.

## For developers

- Page: `app/vehicles/[id]/page.tsx`. It calls `fetchMarketplaceListingById` and renders `VehicleDetailsView` or `VehicleNotFound`. That function returns "no listing" for any API failure, not only 404.
- The page renders the "unavailable" view as a normal page (it does not call Next.js `notFound()`).
- Display helpers: `lib/marketplace/listing-display.ts` (price rounding, mileage format, gallery order, overview text). Labels: `lib/marketplace/vehicle-labels.ts`.
- `?inquire=1` on the address starts the inquiry automatically once. See [Send Inquiry](/docs/marketplace/send-inquiry).
- Endpoint: `GET /api/v1/marketplace/listings/:vehicleId`. The response includes available and coming-soon cars that pass eligibility.
- The dealer profile link uses a fixed origin for the DryvHub app set in `lib/marketplace/site-url.ts`.
- Gallery photos use an empty `alt` text in the thumbnails and main image, a known accessibility gap (see [Theming and UI](/docs/marketplace/theming-and-ui)).

## Related pages

- [Browsing and search](/docs/marketplace/browsing-and-search)
- [Send Inquiry](/docs/marketplace/send-inquiry)
- [What buyers never see](/docs/marketplace/what-buyers-never-see)
- [Troubleshooting and FAQ](/docs/marketplace/troubleshooting-faq)
- [Dealer listings and publishing](/docs/dealer/listings-and-publishing)
