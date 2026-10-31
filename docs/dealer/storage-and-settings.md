---
title: Storage and settings
sidebar_position: 17
description: The Storage meter, the Settings page, and what the app does and does not offer for account and team management.
---

# Storage and settings

This page explains the **Storage** page, the **Settings** page, the user menu, and what to expect (and not expect) for account and team settings.

:::tip[In plain English]
Every photo and document a dealer uploads uses storage space. The Storage page is a fuel gauge for that space. Settings is currently a short page with one item: connecting Facebook.
:::

## Storage

**Menu:** Storage (`/dashboard/storage`).

The page shows a meter: **used** space against the **space included**, for example "of 2 GB included · 1.4 GB remaining". The amount used is calculated by the API each time from the size of the files stored for the dealership: vehicle photos, vehicle documents, onboarding documents, cashback evidence files, and the profile logo and cover.

### Meter states

| Used | Label | What it says |
| --- | --- | --- |
| Under 70% | **Plenty of room** | "Your lot photos still have space to grow." |
| 70% to under 90% | **Approaching the limit** | "Review uploads, or expand before the next batch of photos." |
| 90% or more | **Time to expand** | "New uploads may fail until you add more room." |

### Buttons

- **Request more storage** goes to the [Billing](/docs/dealer/billing) page, because storage comes with the plan.
- **Continue with inventory** returns to the vehicles list.

### How big is the limit?

The limit is a value stored on the dealership record, which starts at 0.5 GB (500 MB). The Billing plan cards advertise 500 MB for Free, 2 GB for Starter, 5 GB for Growth, 15 GB for Pro and 50 GB for Enterprise. This documentation did not find code that raises the stored limit automatically when a plan changes, so confirm with engineering how limits are applied after billing goes live.

:::note
"New uploads may fail" is the app's own warning text. This documentation did not confirm whether uploads are blocked on the server when the limit is reached. Treat the meter as guidance and upgrade before it turns red.
:::

### Tips to save space

- Delete duplicate or blurry vehicle photos.
- Photos are limited to 8 per vehicle.
- Remove old documents that were uploaded by mistake.

## Settings

**Menu:** Settings (`/dashboard/settings`). The page is titled **Settings** with the subtitle "Workspace integrations and preferences."

It currently has **one** card:

| Card | Opens | Purpose |
| --- | --- | --- |
| **Facebook** | `/dashboard/settings/facebook` | "Connect your Page for listing photo posts and Sync to Facebook." |

Full details are in [Facebook integration](/docs/dealer/facebook-integration).

## The user menu

The menu at the bottom of the sidebar has two items:

- **Billing** (opens [Billing](/docs/dealer/billing)).
- **Log out**.

The header at the top of the sidebar (the dealership switcher area) shows the **business name**, the **current plan** and the **verified badge**. It displays one dealership and is not a multi-dealership switcher.

## Account and team settings

**Not available.** The code reviewed contains no screens for:

- Inviting or removing team members.
- Changing a user's role.
- Changing a name, email or password while signed in. (Password reset is possible only from the sign-in page; see [Getting started](/docs/dealer/getting-started).)
- Editing the workspace address.

Admin account counts appear in the plan table, but there is no screen to manage those accounts yet.
## For developers

- Storage page: `app/(session)/dashboard/storage/`, `components/storage/`, `lib/storage/storage-usage.ts`. Usage comes from `storageUsedGb` and `storageLimitGb` on the tenant response.
- Settings: `app/(session)/dashboard/settings/page.tsx`. User menu and header: `components/app-sidebar.tsx` and the dealership switcher component.
- Plan: `docs/plans/storage-page.md` (dealer repo).

## Related pages

- [Billing](/docs/dealer/billing)
- [Facebook integration](/docs/dealer/facebook-integration)
- [Vehicle detail](/docs/dealer/vehicle-detail)
- [Troubleshooting and FAQ](/docs/dealer/troubleshooting-faq)
