---
title: Storage and settings
sidebar_position: 17
description: The Storage meter, the Settings page, workspace summary rows, and where team management lives.
---

# Storage and settings

This page explains the **Storage** page, the **Settings** page, the user menu, and what to expect (and not expect) for account and team settings.

:::tip[In plain English]
Every photo and document a dealer uploads uses storage space. The Storage page is a fuel gauge for that space. Settings gathers integrations, a workspace summary, your account, and appearance. Team invites live on a separate Team page for owners and admins.
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

The page has four sections on one scroll:

| Section | Purpose |
| --- | --- |
| **Integrations** | Facebook connection panel (managers can connect; staff see status only). |
| **Workspace** | Shortcuts to dealer profile, plan, and storage usage at a glance. |
| **Account** | Signed-in user name, email, and role. |
| **Appearance** | Light / dark / system and comfortable / compact layout. |

Facebook connect flows live on `/dashboard/settings/facebook`. Full details are in [Facebook integration](/docs/dealer/facebook-integration).

**Team** is a separate main-nav page below Dealer Profile (`/dashboard/team`). Only owners and admins can open it — see [Team and roles](/docs/dealer/team-and-roles).

## The user menu

The menu at the bottom of the sidebar has two items:

- **Billing** (opens [Billing](/docs/dealer/billing)).
- **Log out**.

The header at the top of the sidebar (the dealership switcher area) shows the **business name**, the **current plan** and the **verified badge**. It displays one dealership and is not a multi-dealership switcher.

## Account changes

From **Settings → Account**, a dealer can see their role (Owner, Admin, or Staff). Changing email or password while signed in is not on this page — use password reset from the sign-in flow ([Getting started](/docs/dealer/getting-started)). Workspace business address is edited on the [Dealer profile](/docs/dealer/dealer-profile) and onboarding checklist, not here.

## For developers

- Storage page: `app/(session)/dashboard/storage/`, `components/storage/`, `lib/storage/storage-usage.ts`. Usage comes from `storageUsedGb` and `storageLimitGb` on the tenant response.
- Settings: `app/(session)/dashboard/settings/page.tsx`. User menu and header: `components/app-sidebar.tsx` and the dealership switcher component.
- Plan: `docs/plans/storage-page.md` (dealer repo).

## Related pages

- [Team and roles](/docs/dealer/team-and-roles)
- [Billing](/docs/dealer/billing)
- [Facebook integration](/docs/dealer/facebook-integration)
- [Vehicle detail](/docs/dealer/vehicle-detail)
- [Troubleshooting and FAQ](/docs/dealer/troubleshooting-faq)
