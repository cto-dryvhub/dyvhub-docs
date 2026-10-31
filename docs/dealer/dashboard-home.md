---
title: Dashboard home
sidebar_position: 3
description: The dealer dashboard landing page, what each number means, how the date filter works, and the banners that can appear.
---

# Dashboard home

This page explains the first screen a dealer sees after signing in: the headline numbers, the charts, the activity table and the banners at the top.

:::tip[In plain English]
The dashboard answers "how is the dealership doing this year?" at a glance: how much was sold, how much profit that made, and how many cars are in each stage.
:::

## What is on the page

The page opens with **Welcome back,** followed by the business name and today's date. Below it, from top to bottom:

1. A **date filter**.
2. Four **number cards**.
3. A **Sales** chart.
4. An **Inventory** donut chart.
5. An **Activity** table with tabs.

## The date filter

| Mode | What it does |
| --- | --- |
| **Yearly** (default) | Shows the chosen year. |
| **Monthly** | Shows one month of the chosen year. |
| **Custom** | Shows a From and To date range. |

:::note
For **Custom**, the numbers and chart are requested for the **year of the From date**, and the sold vehicles in the table are then trimmed to the From–To range. Treat the headline cards as year-based when using Custom.
:::

## The four number cards

| Card | What it means |
| --- | --- |
| **Sales** | Total revenue from vehicles sold in the period (sum of sold prices). |
| **Profit / unit** | Gross profit divided by the number of units sold. Gross profit is revenue minus purchase cost minus vehicle expenses, before overhead. |
| **Days on lot** | Intended to show how long cars take to sell. **Currently always shows 0.0d**, because the dashboard does not receive this figure yet. Use the [Sales Report](/docs/dealer/reports), which has "Avg days to sell". |
| **Units** | Number of vehicles sold in the period. |

:::warning
Do not read the **Days on lot** card as a real result. It displays `0.0d` when no value is supplied, and the dashboard does not supply one.
:::

## Charts

- **Sales** (subtitle "Revenue and gross profit"): a trend over the chosen period.
- **Inventory** ("Units by status"): a donut showing how many vehicles are **Available**, **Sold**, **Coming**, **Reserved**, or **Other**. It is built from the most recent **100** vehicles the page loads, so a dealership with more than 100 vehicles will see counts for those 100 only. The page deliberately avoids loading the full list to stay fast.

## Activity table

A tabbed table underneath the charts:

| Tab | Columns |
| --- | --- |
| **Sales** (default) | Vehicle, Sold price, Cost, Expenses, Profit |
| **Inventory** | A snapshot of units by status |
| **Expenses** | A snapshot of expense lines for the period |

## Banners

Banners appear above the page content on every dashboard page, not only the home page.

| Banner | When it shows | What the dealer should do |
| --- | --- | --- |
| **Finish your onboarding** | Application not yet submitted. Shows steps remaining. | Complete the [onboarding checklist](/docs/dealer/getting-started). |
| **Application under review** | Submitted, waiting for DryvHub. | Wait for a decision. Nothing blocks day-to-day use. |
| **Verify your dealership** | Application not submitted (button: Start Verification). | Open onboarding or the Verification page. |
| **Application under review** (access banner) | Stage 1 reached, status pending (button: Complete Verification). | Wait for a decision. |
| **Verification needs attention** | Application rejected. | Update details or documents on the checklist. |
| **Complete Business Verification** | Stage 1 reached, not pending or rejected, not yet Stage 2. | Open the Verification page. |
| **Upgrade to list on Marketplace** | Stage 2 verified, but on the Free plan (button: View Plans). | Choose a plan on the [Billing](/docs/dealer/billing) page. |
| **Subscription needs attention** | Stage 2 verified, a paid plan is set, but the subscription is not active or trialing. | Restore the subscription. |

No banner shows once the dealer is Stage 2 verified with an active paid plan.

Details on stages and locks are in [Verification and access](/docs/dealer/verification-and-access).

## For developers

- Page: `app/(session)/dashboard/page.tsx` (server component) loading a client island. Do not statically import Recharts; use the existing dynamic wrappers.
- Metrics helpers: `lib/dashboard/metrics.ts`; cards in `components/section-cards.tsx`; chart in `components/chart-area-interactive.tsx`; table in `components/data-table.tsx`.
- Data: `GET /api/v1/vehicles` (page of 100) and the sales summary and profit report endpoints. See [API integration](/docs/developers/api-integration).
- The home page must not fetch all vehicles for first paint (performance rule in the dealer repo `AGENTS.md`).

## Related pages

- [Inventory](/docs/dealer/inventory)
- [Financials](/docs/dealer/financials)
- [Reports](/docs/dealer/reports)
- [Verification and access](/docs/dealer/verification-and-access)
