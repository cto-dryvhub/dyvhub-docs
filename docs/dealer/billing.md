---
title: Billing
sidebar_position: 16
description: The Subscription and Billing page, the plans as shipped, the planned payment system, and what happens when a subscription lapses.
---

# Billing

This page explains the **Subscription & Billing** screen, the five plans, what the planned payment system will do, and what happens when a subscription is not in good standing.

:::warning[Online payment is not live]
At the time of writing, a dealer **cannot pay inside the app**. The plan buttons open a message that says "Online checkout is not live yet." The invoices tab is empty. Everything about automatic charging, trials, retries and grace periods in this page is marked **Planned**.
:::

:::tip[In plain English]
DryvHub has five plans. Every plan includes the full set of dealership tools. The plans differ in **capacity** (how many cars, how many team members, how much storage) and in **Marketplace reach**. Only paid plans can list cars on the Marketplace.
:::

## The plans

Prices are in Philippine pesos per month, as defined in the app.

| | Free | Starter | Growth | Pro | Enterprise |
| --- | --- | --- | --- | --- | --- |
| **Price** | ₱0 | ₱3,000 | ₱5,000 | ₱7,000 | ₱10,000 |
| **Vehicle units** | Up to 3 | Up to 10 | Up to 20 | Up to 50 | 51+ |
| **Admin accounts** | 1 | 2 | 5 | 10 | Unlimited |
| **Storage** | 500 MB | 2 GB | 5 GB | 15 GB | 50 GB |
| **Marketplace listing** | No | Yes | Yes | Yes | Yes |
| **Featured listings** | No | No | No | Yes | Yes |

Starter carries a **Most popular** label.

What every plan includes (from the page itself):

- **Full DryvHub:** "Inventory, P&L, PlateCheck, and reports ship on every plan — including Free."
- **Capacity, not feature gates:** "Upgrade for units, admin seats, storage, and marketplace reach."
- **Verified marketplace:** "Starter and above, with Stage 2 verification. Featured listings from Pro."

Pricing note on the page: "Pricing is reviewed annually. We give 30 days' notice before any increase."

:::note
The unit, admin-account and storage figures are shown on the plan cards. This documentation could not confirm from the code reviewed that every limit is enforced when exceeded. The storage meter does warn as usage grows; see [Storage and settings](/docs/dealer/storage-and-settings).
:::

## The page

**Menu:** Subscription & Billing (also in the user menu as **Billing**), at `/dashboard/billing`.

Two tabs:

| Tab | Content |
| --- | --- |
| **Plans** | A card per plan, with the current plan marked. A button on each card reads **Request** followed by the plan name, or **Talk about Enterprise** for Enterprise. |
| **Invoices** | Currently empty: "No invoices yet…", explaining that invoices appear after checkout is live. |

Pressing a plan button opens a dialog. For example, **Request Starter** says online checkout is not live yet, the workspace stays on its current plan until billing opens, and inventory, documents and photos stay put when moving to the new plan. The only button is **Got it**. The dialog does not send a request to DryvHub by itself.

## Subscription statuses

The dealership record carries a plan and a subscription status.

| Status | Meaning | Marketplace in the dealer app | Public Marketplace |
| --- | --- | --- | --- |
| `trialing` | Trial period. | Allowed (with a paid plan and Stage 2). | Shown. |
| `active` | Paid and current. | Allowed. | Shown. |
| `past_due` | A payment is overdue. | **Treated as a problem**: "Subscription needs attention". | Still shown. |
| `suspended` | Access stopped. | Locked. | Hidden. |
| `canceled` | Ended. | Locked. | Hidden. |

New dealerships start on the **Free** plan with status `trialing`. Since Free cannot list on the Marketplace, the status alone does not unlock selling.

## What happens on a lapse

Today (**implemented**):

1. If a paid dealership's subscription is anything other than active or trialing, the dealer app shows the **Subscription needs attention** banner: "Restore an active paid plan to keep Marketplace access."
2. Publish and sync actions are disabled, and the Inquiries and Cashback pages show the locked panel with: "Your subscription needs attention. Restore an active paid plan to list vehicles on the Marketplace."
3. On the public Marketplace, a dealership whose status is `suspended` or `canceled` stops appearing. `past_due` still appears.
4. Existing data is untouched. The rest of the dashboard (inventory, financials, reports) keeps working.

## Planned: payment, trials and retries

These come from **ADR-0011** in the API repo, which has the status **Proposed** (not accepted). None of it is built in the dealer app.

| Planned item | What the ADR proposes |
| --- | --- |
| **Payment provider** | **PayMongo** runs the recurring billing: it creates invoices, charges the saved payment method each month, and retries a failed charge automatically. DryvHub keeps the dealer's plan, trial, access rules and billing history on its own side. |
| **Payment methods** | Visa or Mastercard cards, and Maya. PayMongo does not support GCash or bank transfer for subscriptions, so a dealer with only those cannot subscribe through this flow. |
| **Checkout** | The dealer pays the first invoice through PayMongo's payment flow, which also saves the payment method for later months. The first payment must be completed within 24 hours or the signup is cancelled and must be restarted. |
| **Invoices and history** | Invoices created by PayMongo are copied into DryvHub so dealers see them on the Invoices tab. |
| **Trial** | A 14-day trial run by DryvHub. No payment provider is involved until the trial ends. |
| **Plan changes** | Upgrades and downgrades take effect at the **next** billing date, not immediately. |
| **Failed payments** | PayMongo retries once a day, up to 3 times. After that, DryvHub starts a grace period and then suspends the dealership, around day 7 after the first failure (the exact length is not decided). |
| **Grace period** | During grace the dealership keeps access and sees a banner asking to update the payment method. A successful payment returns it to active; failure leads to suspended. |
| **Cancelling** | The dealer keeps access until the end of the paid period. DryvHub schedules the cancellation with PayMongo early enough that no further invoice is created. |

:::note
The ADR lists a `grace_period` status, but the database has only `trialing`, `active`, `past_due`, `suspended` and `canceled`. Until the ADR is accepted and built, treat the day counts above as a proposal, not behavior.
:::

:::warning Launch prerequisite
PayMongo must switch on **Subscriptions** and **card vaulting** for DryvHub's account before this can go live. That is a request to PayMongo support, not something engineers can do alone.
:::

:::tip[In plain English]
We are letting PayMongo handle the monthly charging and automatic retries, instead of building our own. DryvHub still decides who has access and what happens when someone stops paying.
:::

:::note
The provider was originally proposed as Maya. It changed to PayMongo in November 2026. Maya is still accepted as one way for a dealer to pay a PayMongo subscription.
:::

## For developers

- Page and cards: `app/(session)/dashboard/billing/`, `components/billing/`; plan data in `lib/billing/dealer-tiers.ts`.
- Plan and status enums: `SubscriptionPlan` and `SubscriptionStatus` in `prisma/schema.prisma` (API repo). Defaults: plan `free`, status `trialing`.
- Access rules that read the plan and status: `lib/access/dealer-capabilities.ts` and `src/core/policies/dealer-access.policy.ts`.
- Plan: `docs/plans/subscription-billing.md` (dealer repo). Decision record: `docs/adr/0011-SaaS-Billing-Using-PayMongo.md` (API repo).

## Related pages

- [Verification and access](/docs/dealer/verification-and-access)
- [Storage and settings](/docs/dealer/storage-and-settings)
- [Listings and publishing](/docs/dealer/listings-and-publishing)
- [Executive overview](/docs/executive/overview)
