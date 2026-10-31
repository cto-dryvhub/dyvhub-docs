---
title: PlateCheck
sidebar_position: 13
description: The PlateCheck page for searching and reporting flagged plates, what results mean, and how flags relate to listings.
---

# PlateCheck

This page explains **PlateCheck**: how to search a plate, what the results mean, how to report or bulk-import a flagged plate, and what flags mean for listings.

:::tip[In plain English]
Before buying a used car, a dealer can type its plate number and see whether **any dealer in the DryvHub network** has reported problems with it, such as fake papers, flood damage or a legal issue. The list is shared: reports from one dealer are visible to all others.
:::

## Who can do what

| Action | Needs |
| --- | --- |
| **Search** | Any signed-in dealer, from day one. |
| **Report plate** and **Import** | Stage 1 (onboarding application submitted). Before that the buttons are disabled with the reason "Complete Stage 1 verification to unlock this feature." |

## Searching

1. Open **PlateCheck** in the menu.
2. Type at least **3 characters** of a plate number or a car model. Search starts automatically after a brief pause (about 0.3 seconds).
3. Spaces and hyphens are ignored, so `ABC 1234`, `ABC-1234` and `ABC1234` match the same plate.

Prompts: before 3 characters the page says "Keep typing to search." With an empty box it says "Search a plate or model to see whether it is flagged."

### Reading the results

| Result | What you see | What it means |
| --- | --- | --- |
| **No flags found** | "Nothing in the registry matches" your search. | No dealer has reported it. This is **not** a guarantee the car is clean. It only means no one has reported it here. |
| **Flagged** | A red banner: "Flagged" and a count of reports, for example "2 REPORTS". Results are grouped by plate. | At least one dealer has reported a problem with that plate. |

Each flag shows:

- The **category** of the problem.
- The **car model**, if given ("Not provided" otherwise).
- **Notes** from the reporter.
- The date: "Reported on" followed by the date.
- **Who reported**: "Your dealership" or "Another dealer in the network". Other dealers are not named.
- An **evidence image**, if one was uploaded.

A **Report This Vehicle** button on a result opens the report form with the plate filled in.

### Flag categories

| Category | Meaning |
| --- | --- |
| **Alarm / Legal Issue** | Open case, alarm or legal problem. |
| **Fake Documents / Encumbered** | Forged papers or the car is under a loan or lien. |
| **Flood / Accident Damage** | Water or crash damage. |
| **Other** | Anything else. Requires a short description of up to 500 characters. |

## Reporting a plate

Choose **Report plate**. The form asks for:

| Field | Rule |
| --- | --- |
| Plate number | Required. |
| Category | Required. "Other" needs a custom description. |
| Car model | Optional, up to 120 characters. |
| Notes | Optional, up to 2000 characters. |
| Image | Optional evidence. JPEG, PNG or WebP, up to 5 MB. |

Limits and errors:

| Message | When |
| --- | --- |
| "This plate is already flagged for that category." | The same plate and category were already reported. |
| "Too many reports just now. Wait a minute and try again." | More than 5 reports in 60 seconds from one user. |
| "Plate check is temporarily unavailable. Try again shortly." | The registry service is down (HTTP 503). |
| "Your session expired. Sign in again." | The sign-in session ended. |

## Importing many plates

Choose **Import** to add many flags at once from a spreadsheet.

- File: **CSV or XLSX**, up to **5 MB** and **1000 rows**.
- Template headers: `plate_number`, `car_model`, `category`, `category_custom`, `note`, `reported_by`. A template can be downloaded in the dialog.
- The result tells you how many rows were **inserted**, how many were **skipped as duplicates**, and a list of **invalid rows** with the row number and the reason.
- Import has **no rate limit**, unlike single reports.

## Does a flag affect a listing?

The platform is built so a flagged plate can keep a car off the Marketplace:

- A listing can have the status **Blocked** (`blocked_platecheck`), and publishing it is refused with "Cannot publish a listing blocked by plate check".
- The public Marketplace hides any vehicle whose `platecheckFlagged` field is true.

**Not verified:** in the code reviewed, nothing automatically sets that field or the Blocked status when a plate is reported or imported. The guards exist, but no automatic link from the shared registry to a dealer's own vehicle was found. Treat the registry as an advisory lookup unless the product team confirms the link. If you operate this system, ask the engineering team how vehicles become blocked.

## For developers

- Page: `app/(session)/dashboard/platecheck/`; components in `components/plate-check/`; helpers in `lib/plate-check/`.
- Endpoints: `GET /api/v1/plates/search`, `POST /api/v1/plates/report`, `POST /api/v1/plates/import`. Reference: `docs/api/plate-check.md` in the API repo.
- The registry is a shared database visible to all authenticated dealers (ADR-0012 in the API repo), separate from the dealer's own tenant data. Access policy: `src/core/policies/dealer-access.policy.ts` (lookup always open, flag and import need Stage 1).

## Related pages

- [Verification and access](/docs/dealer/verification-and-access)
- [Listings and publishing](/docs/dealer/listings-and-publishing)
- [Marketplace eligibility](/docs/marketplace/eligibility)
- [Troubleshooting and FAQ](/docs/dealer/troubleshooting-faq)
