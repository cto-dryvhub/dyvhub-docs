---
title: Team and roles
sidebar_position: 17.5
description: Invite teammates, seat limits by plan, and what owners, admins and staff can access in the dealer dashboard.
---

# Team and roles

This page explains how a dealership adds people to its workspace: who may send invites, how seat limits work, what happens when someone accepts an email link, and how **owner**, **admin** and **staff** roles differ in the sidebar.

:::tip[In plain English]
The person who registered the business is the **owner**. Owners and **admins** can invite colleagues by email and choose whether each person is an **admin** (full access) or **staff** (day-to-day inventory and buyer work, but not billing or financials). Each plan allows only so many **seats** at once; pending invites count toward that cap.
:::

## Who can invite

Only the **owner** and **admins** can open the Team page and send invitations. **Staff** do not see Team in the sidebar and cannot reach the page.

| Role | Team management |
| --- | --- |
| **Owner** | Full team page: invite, resend, revoke, change roles, activate or deactivate members |
| **Admin** | Same as owner for team tasks |
| **Staff** | No access |

:::note
There is only one **owner** per dealership. Invites are always for **admin** or **staff** — never for a second owner.
:::

## How to invite someone

**Menu:** **Team** in the main sidebar, below Dealer Profile (`/dashboard/team`).

1. Choose **Invite user**.
2. Enter the person's **email** and pick a role: **Admin** or **Staff**.
3. DryvHub sends an email with a personal link. The link is valid for **7 days** (resending a pending invite refreshes the expiry).
4. On the Team page, pending invites appear in a table. From there an owner or admin can **Resend** or **Revoke** an invite that has not been accepted yet.

The page header also shows seat usage, for example **2 of 5 seats on Growth**.

:::warning[Rate limit]
The API allows at most **5 new invites per dealership per hour**. If sending fails for that reason, wait and try again.
:::

## How the invitee joins

The invitee opens the link from the email. The app shows which dealership invited them, the invited **email**, and the **role**.

They can join in either of these ways:

| Method | What happens |
| --- | --- |
| **Email and password** | They set a password (at least 8 characters), create or use an account for the invited email, and join the workspace. |
| **Continue with Google** | They sign in with Google. The Google account email **must match** the invite email (not case-sensitive). If they signed in with a different Google account, the app signs them out and asks them to use the correct email. |

After a successful join, the app sends them to their default home:

| Role | First screen |
| --- | --- |
| Owner or admin | Dashboard home (`/dashboard`) |
| Staff | Inventory (`/dashboard/inventory`) |

Someone who already has a DryvHub account can accept while signed in, as long as the session email matches the invite.

:::note
If the link is wrong, expired, or already used, the page says the invite is invalid. For security the app does not say which of those cases applied.
:::

## Seat limits by plan

Seat limits match the **Admin accounts** row on the [Billing](/docs/dealer/billing) plan table. The **owner always uses one seat**. Each **active** member uses a seat. **Pending** invites (and invites where email delivery failed but the invite is still open) also count. **Inactive** members do **not** count.

| Plan | Seats (including owner) |
| --- | --- |
| Free | 1 |
| Starter | 2 |
| Growth | 5 |
| Pro | 10 |
| Enterprise | Unlimited |

When the dealership is at the cap:

- The **Invite user** button is disabled.
- The page shows **Upgrade to add someone**, linking to [Billing](/docs/dealer/billing).
- Sending or accepting a new invite returns a seat-limit error if someone else joined in the meantime.

On **Free**, with only one seat, only the owner can use the workspace until the plan is upgraded.

## What staff can and cannot do

Staff are meant for inventory, listings, buyer follow-up, and profile upkeep — not subscription or financial control.

### Staff can access

| Area | Notes |
| --- | --- |
| **Inventory** and **Listings** | Full vehicle and listing workflows |
| **Inquiries** | Buyer inquiries for the dealership |
| **Cashback** | Cashback claims workflow |
| **Dealer profile** | Public dealership profile |
| **PlateCheck** | Plate lookup tools |
| **Onboarding checklist** | Business verification checklist |
| **Settings** | With limits (see below) |

### Settings for staff

On [Settings](/docs/dealer/storage-and-settings#settings) (`/dashboard/settings`), staff see the same sections but with tighter control:

| Section | Staff experience |
| --- | --- |
| **Integrations (Facebook)** | **Summary only** — connection status and page name. No Connect, Reconnect, or Disconnect. |
| **Workspace** | **Dealer profile** link works. **Plan & billing** and **Storage** show plan name and storage meter as read-only text (no links to those pages). |
| **Account** | Name, email, and role summary |
| **Appearance** | Theme and density preferences |

### Staff cannot access

These items are hidden from the sidebar. Opening the URL directly sends staff back to **Inventory**.

| Hidden from staff |
| --- |
| Dashboard home |
| Financials (all sub-pages) |
| Reports |
| Subscription & Billing |
| Storage |
| Verification |
| Team |
| Facebook connect, reconnect, disconnect (`/dashboard/settings/facebook`) |

## Admins and owners

**Admins** use the same dashboard as the **owner**: every menu item, billing, storage, verification, team management, and Facebook connection.

Differences on the Team page:

| Rule | Behavior |
| --- | --- |
| **Owner row** | Role stays **Owner**. No role dropdown. No deactivate control. |
| **Self** | You cannot change your own role or deactivate yourself from the team table. |
| **Other members** | Owner and admins can switch a member between **Admin** and **Staff**, or **Deactivate** / **Activate**. |

## Deactivating a member

**Deactivate** sets the member to **inactive**. Inactive users cannot sign in to the dealership dashboard — the API treats them as having no active membership. Their seat is freed immediately, so another invite can use it without upgrading.

**Activate** turns access back on, subject to the current seat cap.

## Roles at a glance

| Capability | Owner | Admin | Staff |
| --- | --- | --- | --- |
| Invite and manage team | Yes | Yes | No |
| Dashboard home | Yes | Yes | No (lands on Inventory) |
| Financials and reports | Yes | Yes | No |
| Billing and storage pages | Yes | Yes | No (read-only summary in Settings) |
| Facebook connect / disconnect | Yes | Yes | No (status only) |
| Inventory, listings, inquiries, cashback | Yes | Yes | Yes |

## For developers

- Team UI: `app/(session)/dashboard/team/`, `components/team/`.
- Invite accept: `app/(session)/invite/[token]/`.
- Role paths: `lib/access/role-access.ts`.
- Settings staff vs manager: `components/settings/settings-workspace-section.tsx`, `components/settings/facebook-connection-panel.tsx`.
- API: `docs/api/tenant-invites.md` in the `dryvhub-api` repo (`/api/v1/tenant-users`, `/api/v1/auth/invites/*`).
- Seat policy: `src/core/policies/team-seat-limit.policy.ts` (API repo).

## Related pages

- [Billing](/docs/dealer/billing) — plan prices and seat caps per tier
- [Storage and settings](/docs/dealer/storage-and-settings) — Settings layout and storage meter
- [Getting started](/docs/dealer/getting-started) — sign-up, sign-in, and password reset
- [Facebook integration](/docs/dealer/facebook-integration) — what managers connect for listing sync
