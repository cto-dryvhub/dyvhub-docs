---
title: Troubleshooting and FAQ
sidebar_position: 19
description: Answers to common dealer questions and error messages, with the reason behind each one.
---

# Troubleshooting and FAQ

This page answers the questions dealers and support staff ask most, using the exact messages the app shows.

:::tip[In plain English]
Most "it does not work" moments fall into three buckets: something is **locked** until verification or a plan is in place, an **upload** was too large or the wrong type, or a **sign-in code** expired. Find your message below.
:::

## Signing in and signing up

### I never got the 6-digit code. What do I do?

Check the spam folder, then wait for the **Resend** button to unlock. It is locked for 60 seconds after each send. Pressing it too often shows "Too many requests. Please wait before requesting another code." The email is sent through DryvHub's email provider, so an incorrectly typed address is the usual cause.

### It says "Your verification code has expired."

Codes last 10 minutes. Request a new one. After five wrong tries the message is "Too many failed attempts. Request a new code." and the old code stops working, so a new one is required.

### "Email or password is incorrect."

The pair did not match. Use the password reset on the sign-in page. If the dealer signed up with Google, use **Continue with Google** instead of a password.

### I reset my password but it will not save.

The new password must be **at least 8 characters** and both boxes must match ("Password must be at least 8 characters." or "Passwords do not match."). On success: "Password updated. Redirecting to dashboard..."

### I signed in on the main site but I am asked to sign in again on my dealership address.

The sign-in session is passed between addresses through a one-time hand-off. If a browser extension or an unusual link strips it, open the workspace address directly (`{your-subdomain}.dryvhub.com`) and sign in there. See [Getting started](/docs/dealer/getting-started).

## Locked features and verification

### Why is Facebook, or the Report plate button, grayed out?

"Complete Stage 1 verification to unlock this feature." Submit the onboarding checklist first. See [Verification and access](/docs/dealer/verification-and-access).

### Why can I not publish to the Marketplace?

Both of these are needed:

1. **Stage 2** verification (approved by DryvHub).
2. A **paid plan** (Starter or higher) with an active or trialing subscription.

The exact message tells you which is missing. For example, "Your dealership is verified. Upgrade to Starter or higher to list vehicles on the DryvHub Marketplace." means step 1 is done but the plan is Free. Because online payment is not live yet, the plan buttons only open an explanatory dialog. See [Billing](/docs/dealer/billing).

### The Inquiries and Cashback pages show a locked panel.

They share the Marketplace rules. They unlock only when the dealership is Stage 2 verified with an active paid plan.

### I submitted my documents. What happens now?

The banner "Application under review" shows. Nothing blocks day-to-day use. DryvHub staff will approve or reject and the dealer is emailed. If rejected, the Verification page says "Application needs attention". Update details or replace documents on the checklist and contact support. The app has no resubmit button. See [Admin portal](/docs/dealer/admin-portal) for the staff side.

## Uploads

### My document or photo will not upload.

| Upload | Limits |
| --- | --- |
| Onboarding registration documents | PDF up to 10 MB, or JPEG/PNG/WebP up to 5 MB. |
| Showroom photos | JPEG/PNG/WebP up to 5 MB each. |
| Vehicle photos | JPEG/PNG/WebP, 8 per vehicle, 10 MB each by default. |
| Vehicle documents | PDF, JPEG, PNG or WebP, 15 MiB each, 1 to 8 per batch. |
| Dealer profile logo | JPEG/PNG/WebP up to 5 MB. |
| Cashback evidence | PDF, JPEG, PNG or WebP, up to 15 MB. |
| PlateCheck evidence image | JPEG/PNG/WebP up to 5 MB. |

If the type and size are fine, check the [Storage](/docs/dealer/storage-and-settings) page. At 90% or more it warns "New uploads may fail until you add more room."

### Replacing an onboarding document failed halfway.

Replacement deletes the old file first, then uploads the new one, because there is no one-step swap. If the upload fails, the page shows a retry for the new file. Retry it, and the document will be restored.

## Listings and Facebook

### The listing is published but Marketplace shows Failed.

Publishing succeeds even when the Marketplace sync fails. Use **Retry Marketplace** on the Listings page. Facebook behaves the same way with **Retry Facebook**. See [Listings and publishing](/docs/dealer/listings-and-publishing).

### "Cannot publish a listing blocked by plate check."

The vehicle is blocked because of a PlateCheck flag. Resolve the flag with DryvHub support before publishing. See [PlateCheck](/docs/dealer/platecheck).

### Facebook connect says "No Facebook Pages with permission to post were found."

The Facebook account used is not an admin of any Page, or it does not allow posting. Sign in to Facebook with the account that manages the business Page and try again. Other connect errors are listed in [Facebook integration](/docs/dealer/facebook-integration).

### I used Bump and now says "The previous Facebook Page post was removed."

The old post was deleted but the new post could not be created. Facebook shows **Failed**. Use **Retry Facebook** to post again. Comments and reactions on the old post are gone.

### The Facebook posts disappeared after we sold the car.

By design. Recording a sale deletes the vehicle's Facebook posts. See [Expenses and sales](/docs/dealer/expenses-and-sales).

## Sales and numbers

### I cannot save the sale. It says "Sold price is required."

Buyer first name, sale date, sold price and payment method are required. The deposit cannot be more than the sold price. See [Expenses and sales](/docs/dealer/expenses-and-sales).

### The dashboard says "Days on lot 0.0d" for every month.

That card is not fed with data yet and always shows `0.0d`. Use "Avg days to sell" on the [Sales Report](/docs/dealer/reports).

### The inventory donut does not add up to my stock.

It counts the 100 most recent vehicles loaded by the dashboard. Use the [Inventory Report](/docs/dealer/reports) for full counts.

## PlateCheck

### "This plate is already flagged for that category."

Someone (maybe your own dealership) already reported that plate under the same category. Report under a different category only if it applies.

### "Too many reports just now. Wait a minute and try again."

Single reports are limited to 5 per minute per user. For many plates use **Import**, which has no rate limit but is limited to 1000 rows per file.

### "Plate check is temporarily unavailable. Try again shortly."

The plate registry could not be reached (HTTP 503). Retry in a few minutes.

## Still stuck?

- Check [Verification and access](/docs/dealer/verification-and-access) for the exact lock message you see.
- For definitions, see the [Glossary](/docs/start/glossary).
- For API and tenant behavior, see [Auth and tenancy](/docs/developers/auth-and-tenancy) and [API integration](/docs/developers/api-integration).

## Related pages

- [Dealer app overview](/docs/dealer/overview)
- [Getting started](/docs/dealer/getting-started)
- [Verification and access](/docs/dealer/verification-and-access)
- [Welcome](/docs/start/welcome)
