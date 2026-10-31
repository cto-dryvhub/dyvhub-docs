---
title: Browsing and search
sidebar_position: 3
description: The Marketplace home page sections, the inventory page, every filter, sort and paging option, the stock tabs, and how page-address parameters work for sharing links.
---

# Browsing and search

This page describes how buyers find cars: the home page, the inventory page (`/vehicles`), each filter and sort option, and how the page address captures a search so support staff can share it.

:::tip[In plain English]
Buyers can start from the home page search box or jump straight to **Browse Cars**. On the inventory page they narrow the list with filters on the left (or a **Filters** button on phones) and sort it. Every choice is written into the page address, so copying the address from the browser shares exactly what you see.
:::

## The home page (`/`)

The home page is a marketing-style front door. From top to bottom:

| Section | What it shows | Notes |
| --- | --- | --- |
| **Hero** with search | Headline, a search box, a few quick pickers (see below) and four trust points. | Trust points: "Verified dealer inventory", "PlateCheck-backed protection", "No signup required to inquire", "Cashback on eligible purchases". |
| **Hero numbers** | Optional proof such as "N+ verified vehicles" and "N+ verified dealers". | Shown only when there is enough real data: at least 10 vehicles for the vehicle number, and at least 3 dealers (counted from a complete sample) for the dealer number. Otherwise a plain sentence is used. |
| **Featured cars** (or **Verified listings**) | A scrolling row of up to 12 cars. | If at least one of the newest cars is flagged featured, the row is titled **Featured cars** and shows **only** featured cars. If none are featured, it is titled **Verified listings** and shows the newest cars. |
| **Browse by make** | Shortcuts for Toyota, Honda and Mitsubishi. | Each opens `/vehicles?make=Toyota` (and so on). A "view all" link opens the full inventory. |
| **Editor's picks** | Three cars. | Uses featured cars if there are at least three; otherwise the newest three. The section is hidden when there are no cars. |
| **Cashback** | A short explanation with a link to the cashback page. | See [Cashback claims](/docs/marketplace/cashback-claims). |
| **How it works** | A four-step guide. | Linked from the menu as **How It Works**. |

:::note
A testimonials section exists in the code but is switched off, so buyers do not see it today.
:::

**Where the home cars come from.** The home page asks the API for the newest available cars (up to 100) and picks from those, so "featured" means "featured among the 100 newest cars." If the API is down, the page still loads and simply shows empty sections. It never shows made-up cars.

**What "featured" means.** A car is marked featured by the backend, and only for dealers on plans that qualify. The website just shows the flag. See [Eligibility](/docs/marketplace/eligibility).

### Hero quick pickers

The hero search can combine free text with these choices, then opens `/vehicles` with the matching parameters:

| Picker | Options |
| --- | --- |
| Body type | Hatch, Sedan, Crossover, SUV, Pickup, Van |
| Maximum price | Same price steps as the inventory page |
| Minimum year | 2010+, 2015+, 2020+ |

## The inventory page (`/vehicles`)

The page heading shows how many vehicles match (for example "12 Vehicles", or "1 Vehicle"). Below it:

- **Filters** on the left on large screens. On phones and tablets a **Filters** button opens the same filters in a slide-out panel.
- **Active filter chips** above the results. Each chip has a remove button, plus a **Reset filter** button.
- **Sort by** drop-down and a **List / Card** layout toggle. The layout choice is a display preference only and is not part of the page address.
- **Pagination** at the bottom.

### Every filter

| Filter (label on screen) | Choices | Page-address parameter |
| --- | --- | --- |
| **Search** (placeholder "Make or model") | Free text. All words must match somewhere in the car's make, model, variant, or year. | `q` |
| **Stock** | **All vehicles** or **Coming soon** | `status=coming` for Coming soon (nothing for All vehicles) |
| **Brand** | Brands found in the current results | `make` |
| **Model** | Models found in the current results | `model` |
| **Body type** | All Vehicles, Sedans, Crossovers, SUVs, Trucks, Vans, Hatchbacks | `category` (`sedan`, `crossover`, `suv`, `pickup`, `van`, `hatch`) |
| **Transmission** | Any, Manual, Automatic, CVT | `transmission` (`manual`, `automatic`, `cvt`) |
| **Fuel** | Any, Gasoline, Diesel, Hybrid, Electric | `fuelType` (`gasoline`, `diesel`, `hybrid`, `electric`) |
| **Minimum year** | Any, 2010+, 2015+, 2020+ | `minYear` |
| **Maximum price** | Any, Under ₱300K, ₱500K, ₱750K, ₱1M, ₱1.5M, ₱2M | `maxPrice` (in pesos, for example `500000`) |

:::warning[Brand and Model lists]
The Brand and Model drop-downs list only what is present in the **results currently loaded** (plus whatever is already selected). If a brand seems "missing" from the list, it may simply not be in the current results. Clear other filters first.
:::

### The stock tabs

| Tab | What the buyer sees |
| --- | --- |
| **All vehicles** | Cars with the *available* status. This is the normal "for sale now" list. |
| **Coming soon** | Cars the dealer has marked as *coming* (not yet on the lot). They are listed in a separate tab and are not mixed into **All vehicles**. |

The label "All vehicles" can be misleading: it does **not** include coming-soon cars. The backend decides which cars belong to each tab; the website never builds its own coming-soon list.

### Sort options

| Label | Parameter value |
| --- | --- |
| Newest listed (default) | none (the default is not written to the address) |
| Price: low to high | `sort=price:asc` |
| Price: high to low | `sort=price:desc` |
| Year: newest | `sort=year:desc` |
| Mileage: lowest | `sort=mileage:asc` |

### Pagination

- 20 cars per page by default.
- **Previous** and **Next** buttons with "Page X of Y".
- Parameter `page` (page number, starting at 1) and `take` (cars per page). The API allows at most 100 per request. Defaults are not written to the address.
- Changing any filter or the sort sends the buyer back to page 1.

### Empty and error states

| Situation | What the buyer sees |
| --- | --- |
| No matches | "No vehicles match your filters. Try adjusting search or filters." with a **Reset filters** button. |
| Nothing listed at all | "Live inventory appears here as dealers publish eligible stock." |
| Coming soon tab is empty | "Coming-soon vehicles will appear here when this inventory becomes available." |
| API problem | "We couldn't load vehicles. Please try again." with a **Retry** button. |

## How the page address works (for support staff)

The whole search lives in the address after the `?`. Parameters are joined with `&`. Example address shape (shown as a code sample):

```text
/vehicles?make=Toyota&category=suv&maxPrice=1000000&sort=price:asc&page=2
```

Practical tips:

1. **To share a search**, set up the filters, wait a moment (the address updates shortly after a change), then copy the address from the browser bar.
2. **To send a buyer to one car**, share `/vehicles/{id}` instead. See [Vehicle details](/docs/marketplace/vehicle-details).
3. **Unknown or empty parameters are ignored.** A mistyped parameter does not break the page.
4. An older address style `?availability=coming-soon` still works and is treated like `status=coming`.
5. **Search engines treat filtered pages as the same page** as `/vehicles` (the canonical address has no parameters). See [SEO and sharing](/docs/marketplace/seo-and-sharing).
6. The page is first built on the server from the address, so a shared link shows results immediately and then stays up to date as the buyer changes filters.

## For developers

- Inventory screen: `components/marketplace/inventory/*`; address parsing: `lib/marketplace/inventory-filters.ts`; API query mapping and sort values: `lib/marketplace/listings-query.ts`; data hook: `hooks/marketplace/use-marketplace-listings.ts`; service: `services/marketplace-listings.service.ts`.
- The server renders the first page of results from the address ("seed"). The client then refetches with TanStack Query as filters change.
- The backend accepts more filters than the screen exposes (for example variant, color, mileage range and dealer subdomain). The website only uses the ones listed above. Authoritative names are in the API's Swagger documentation.
- API search matches make, model and variant (case-insensitive) and exact year when a word is a number. It does **not** search dealer names.
- Transmission and fuel values must match what the backend stores. The website only offers the listed values.

## Related pages

- [Vehicle details](/docs/marketplace/vehicle-details)
- [Eligibility](/docs/marketplace/eligibility)
- [Buyer journey](/docs/marketplace/buyer-journey)
- [Troubleshooting and FAQ](/docs/marketplace/troubleshooting-faq)
- [Dealer listings and publishing](/docs/dealer/listings-and-publishing)
