---
title: Troubleshooting and FAQ
sidebar_position: 12
description: Practical answers for support and operations about missing listings, prices, photos, Send Inquiry and Messenger problems, cashback claims, search, themes and link previews.
---

# Troubleshooting and FAQ

This page gives short, practical answers to the questions support and operations hear most about the Marketplace. Each answer points to the page with the full explanation.

:::tip[In plain English]
Most problems fall into three groups: **a car is not visible** (usually a rule about the dealer or the car's status), **a buyer cannot start or finish an inquiry** (usually the dealer's Messenger setup or a gone listing), or **a cashback claim is stuck** (usually the sale is not recorded yet, the name does not match, or timing needs review).
:::

## Listings and search

### A dealer says their car is not on the Marketplace. Why?

The backend shows a car only when seven rules all pass: eligible paid plan, Stage 2 verification approved, active account, car in an eligible state, listing published, no PlateCheck block, and not sold or archived. Work through the checklist and lookup table in [Eligibility](/docs/marketplace/eligibility).

### The car shows on its direct link but not in the list. Why?

The car is probably marked **coming soon**. Coming-soon cars are hidden from the default **All vehicles** list, the home page and the sitemap, but still open from a direct link. Look under the **Coming soon** stock tab. See [Browsing and search](/docs/marketplace/browsing-and-search).

### A buyer sees "Listing unavailable". What does it mean?

Either the car is no longer public (sold, unpublished, archived, flagged, or the dealer lost eligibility), the link is wrong, or the site could not reach the API at that moment. The page cannot tell these apart. Reload once, then check eligibility. See [Vehicle details](/docs/marketplace/vehicle-details).

### Search returns nothing even though the car exists.

The search box requires **every word** to match the make, model, variant or year. "Toyota Vios sedan" may return nothing because "sedan" is not part of the car's name. Try fewer words, or use the **Body type** filter. Also check that other filters are not narrowing the list, and use **Reset filters**. See [Browsing and search](/docs/marketplace/browsing-and-search).

### A brand or model is missing from the Brand/Model drop-down.

Those lists show only what is in the **currently loaded results**. Clear other filters, or search by name. Also confirm the car is public (see [Eligibility](/docs/marketplace/eligibility)).

### The "Featured" row or badge does not show a dealer's car.

Featured is decided by the backend: the dealer must be on a featured-eligible plan (the higher plans) **and** the car must be flagged featured. Also, the home page looks only at the 100 newest cars. See [Eligibility](/docs/marketplace/eligibility).

### The page says "We couldn't load vehicles."

The site could not get a response from the API. Press **Retry**. If it keeps failing, it is an API or network issue: ask a developer to check the API status and the site's API address setting. The home page keeps working with empty sections in this case.

## Price and photos

### The price on the site is different from what the dealer says.

Check these in order:

1. **The dealer changed it recently.** The page shows the current price from the Dealer app. Reload.
2. **Rounding.** The site shows whole pesos, so centavos are not shown.
3. **DP versus price.** The large number is the asking price. **DP** is the down payment, shown separately (a dash means none was entered).
4. **Search previews.** Link previews and search results may show an older price until refreshed.

The price is always the dealer's asking price. DryvHub does not set it. See [Vehicle details](/docs/marketplace/vehicle-details).

### Photos are broken, blank or say "No photos available".

- **Blank or broken after a while:** photos use time-limited secure links. Reload the page for fresh links.
- **"No photos available":** the dealer has not uploaded photos for that car (a dealer fix in the Dealer app).
- **Still broken after reload:** report it to a developer with the car's ID (shown on the details page).

### A brand logo on the home page is missing.

The Toyota shortcut in the "Browse by make" section may reference a file name that does not match the stored file (`.jpg` versus `.png`), so the logo could fail to load while the link still works. This was **not confirmed in a browser**. Report it to a developer.

## Send Inquiry and Messenger

### The inquiry window says "This listing is no longer available."

The car stopped being public between the buyer opening the page and tapping **Send Inquiry** (for example, it was just sold). Nothing was sent. See [Send Inquiry](/docs/marketplace/send-inquiry).

### The window says "This dealer isn't set up for Messenger inquiries yet."

The dealer has not connected a Facebook page (or has an unusable one) in the Dealer app. The dealer must fix this. Until then, inquiries for that dealer cannot start. See [Dealer inquiries](/docs/dealer/inquiries).

### "We couldn't start this inquiry. Please try again."

A general failure: network problem, server error, a malformed link, or **too many attempts** (the limit is 5 per minute for the same visitor and car). Wait a minute and try again. If it keeps happening, tell a developer the car ID and time.

### Messenger did not open, or opened with an empty message box.

- The buyer must tap **Send** in the inquiry window. The inquiry is recorded when the window opens, but Messenger only opens after **Send**.
- On a phone, the Messenger app link is used; on a computer, the Messenger website. If the app is not installed or the browser blocks the redirect, open Messenger manually.
- The pre-filled text is a convenience that Facebook may not always honor. The **inquiry code** is shown in the window with a **Copy** button. Paste it into the chat.
- Even if the buyer never sends the message, the inquiry exists in DryvHub.

### A buyer lost their inquiry code.

The code appears in the inquiry window and in the Messenger message the buyer sent. The dealer can also find it in their **Inquiries** list in the Dealer app. See [Dealer inquiries](/docs/dealer/inquiries).

### A buyer started several inquiries for the same car.

Each time the window opens, a **new** inquiry and code are created. The cashback claim should use the code from the inquiry that led to the purchase (the one in the chat with the dealer).

## Cashback

### Cashback claim says "That inquiry ID is invalid."

The code was mistyped or does not exist. Codes look like `DH-` plus 8 letters and digits (no `I`, `O`, `0` or `1`). Compare it with the code in the Messenger chat.

### "The sale is not confirmed yet."

The dealer has not recorded the car as sold (with a sold price) in the Dealer app. A buyer **cannot claim before the sale is recorded**. Ask the dealer to record the sale, then retry. See [Cashback claims](/docs/marketplace/cashback-claims).

### "The buyer name does not match the completed sale."

The name entered must match the buyer name the dealer recorded on the sale (ignoring capital letters and extra spaces). Use the name on the OR/CR. If the dealer typed it differently, ask the dealer to correct the sale record.

### "A cashback claim already exists for this inquiry or vehicle."

Only one claim is allowed per inquiry and per car. The buyer may have already submitted one, possibly in another tab or device. An admin can look it up.

### "This dealer is not eligible for cashback on this purchase."

The dealer's cashback standing is suspended or revoked (for example after confirmed fraud strikes). This is a backend decision. See [Dealer verification and access](/docs/dealer/verification-and-access).

### The claim says "On hold for review". Is it rejected?

No. It means the inquiry was created at or after the sold date, so an admin must review the timing. See [Cashback claims](/docs/marketplace/cashback-claims).

### What does the buyer do after "Claim received"?

Wait for the DryvHub team to review. Today the site cannot show later status updates, and how buyers are notified of the outcome is not defined in the code reviewed. If asked for more proof, the buyer uses **I was asked for more evidence** on the cashback page, with the claim ID and inquiry ID. See [Cashback claims](/docs/marketplace/cashback-claims).

### The buyer expected ₱2,000 but sees a different amount.

The site's text says "flat ₱2,000," but the backend works out the amount as a percentage of the sold price using the rate locked at inquiry time. The amount shown after submitting is the API's number. Which is the intended policy is not verified. See the warning in [Cashback claims](/docs/marketplace/cashback-claims).

### "Too many attempts. Wait a few minutes and try again."

The rate limit allows 5 attempts per 60 seconds for the same visitor and key. Wait and retry.

### A buyer closed the tab and cannot see their claim any more.

The site remembers the last claim only for the current browser tab. The claim itself is safe in the system. Ask a DryvHub admin to look it up.

## Appearance and sharing

### The site is always dark. Can buyers change it?

Yes: use the sun/moon button in the header. The first visit starts in dark mode, and the choice is remembered on that device. See [Theming and UI](/docs/marketplace/theming-and-ui).

### The Share button does nothing.

The browser lacks the device's share feature (common on desktops). Copy the address from the browser instead. See [SEO and sharing](/docs/marketplace/seo-and-sharing).

### A shared link shows the wrong preview, or the link inside the Messenger message points to the wrong site.

Previews and canonical links are built from the site's configured public address, and the Messenger message link is built by the backend from its own public-origin setting. A wrong or unset value causes wrong links. Production values were not verified here. Ask a developer to check both. See [SEO and sharing](/docs/marketplace/seo-and-sharing).

## When to escalate to a developer

Gather: the car ID (shown on the details page), the exact message the buyer saw, the time (with time zone), the device and browser, and the inquiry code or claim ID if relevant. Do not paste personal data or secrets into tickets. Then see [Architecture](/docs/developers/architecture) and [API integration](/docs/developers/api-integration).

## Related pages

- [Eligibility](/docs/marketplace/eligibility)
- [Send Inquiry](/docs/marketplace/send-inquiry)
- [Cashback claims](/docs/marketplace/cashback-claims)
- [Glossary](/docs/start/glossary)
- [Marketplace overview](/docs/marketplace/overview)
