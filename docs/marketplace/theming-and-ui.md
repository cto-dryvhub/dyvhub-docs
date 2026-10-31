---
title: Theming and UI
sidebar_position: 11
description: How the Marketplace looks and behaves, including light and dark mode, color themes, the brand style, responsive layout and the accessibility features that exist today.
---

# Theming and UI

This page describes the Marketplace's look and feel: light and dark mode, the color theme picker, the brand style, how it adapts to phones, and which accessibility features are actually in place.

:::tip[In plain English]
The site is built around big car photos, a clean layout and DryvHub's **vibrant blue**. It starts in **dark mode** and remembers a buyer's choice of light or dark, and of one of twelve optional color themes. It works on phones and desktops. It has keyboard-friendly dialogs, a "skip to content" link and labelled form fields. A few accessibility gaps exist and are listed honestly below.
:::

## Light and dark mode

- The site **starts in dark mode** for first-time visitors. It does **not** follow the visitor's device setting on the first visit.
- The sun/moon button in the header switches between modes. Its label reads "Switch to light mode" or "Switch to dark mode" and it reports whether it is pressed.
- The choice is saved in the browser (local storage, key `dryvhub-theme`) and applied before the page paints, so there is no white flash.
- Clearing browser data resets it to dark.

## Color themes (palettes)

Buyers can open **Choose your theme** from the header menu to pick one of twelve color themes:

White, Purple & Orange; Dark Pink & White; Blue & Mint; Red & Black; Blue Shades & White; White & Lime Green; Midnight Navy & Champagne Gold; Forest Green & Warm Ivory; Obsidian Black & Platinum Silver; Royal Blue & Soft Sand; Deep Navy & Steel Blue; Slate Charcoal & Trust Teal.

- On phones the picker opens as a side sheet; on larger screens as a dialog.
- The choice is saved in the browser (key `dryvhub-palette`). With no choice saved, the default DryvHub blue look is used.
- This is a personal preference stored only on that device. Different devices can show different themes.

## The brand look

| Element | Value in the code |
| --- | --- |
| Main brand color | Blue `#2563EB` (hover `#1D4ED8`) |
| Accent | Light blue `#60A5FA` |
| Luxury highlight | Gold `#D4AF66` |
| Light canvas | White with soft grey-blue surfaces |
| Dark canvas | Deep navy `#0F172A` with slate surfaces |
| Font | Outfit (loaded through the framework's font system) |
| Style | Photography first, square-ish corners, price up front |
| Name shown in the header and titles | **Marketplace by DryvHub** |

All colors are defined once as shared variables in `app/globals.css`, so themes work by swapping those values.

## Layout and responsiveness

- **Header**: full navigation on large screens (Browse Cars, Featured, Cashback, How It Works, For Dealers) and a menu button on small screens that opens a side sheet. The header becomes more compact once the page scrolls. On the home page it overlays the hero image.
- **Inventory page**: filters sit in a left column on large screens and move into a **Filters** slide-out on phones and tablets. Results can be shown as a list or as cards.
- **Home page**: the featured row scrolls sideways with **Previous listings** and **Next listings** buttons.
- **Vehicle details**: gallery and info panel sit side by side on large screens and stack on small ones. Photos can be enlarged to full screen.
- **Install as an app**: the site publishes a web app manifest so a phone can add it to the home screen and show it full-screen.

## Accessibility features that exist today

| Feature | Where |
| --- | --- |
| **Skip to content** link at the top of each page, visible when focused with the keyboard | Home, inventory, details, dealers and cashback pages |
| **Labelled form fields**: every input has a visible or screen-reader label (the inventory filters use screen-reader-only labels for drop-downs) | Filters, inquiry window, cashback forms |
| **Screen-reader announcements** for changing content: result count updates ("Updating..."), photo counter, "Loading vehicles...", "Copied" after copying a code | Inventory, gallery, inquiry window |
| **Pressed and current states** exposed to assistive tech: theme button, stock tabs, list/card toggle, current page in navigation | Header, inventory |
| **Dialogs and side sheets** built on an accessible component library (focus is kept inside and Escape closes) | Inquiry window, filters sheet, theme picker, mobile menu |
| **Keyboard use of the gallery**: arrow keys move between photos in the full-screen view; every button has a text label | Vehicle details |
| **Descriptive link names**, for example "View details for 2019 Toyota Vios 1.3 E" on listing cards | Inventory and home |
| **Reduced motion**: header transitions are turned off for visitors who ask their device to reduce motion | Header and some animations |
| **Visible keyboard focus** styles on header links, dealer links and other controls | Various |
| **Language and region**: pages declare English; link previews declare English (Philippines) | Whole site |

:::warning[Known gaps]
- **Listing photos have empty `alt` text** (the descriptive text for images) in cards, the main gallery image and thumbnails. Screen-reader users get the car's name from the card link or page heading but not from the photo. The enlarged photo does carry a description.
- The brand-logo images on the home page are decorative (empty `alt`), which is fine because the brand name is next to them.
- No formal accessibility audit or automated accessibility test was found. Treat the table above as "features present in the code," not as certified WCAG compliance.
- The Share button silently does nothing on browsers without the Web Share feature. See [Vehicle details](/docs/marketplace/vehicle-details).
:::

## For developers

- Theme logic: `lib/marketplace/theme.ts` (default dark, storage key, init script) and `lib/marketplace/color-palettes.ts` (twelve palettes, `data-palette` attribute on the page root, storage key). Components: `components/marketplace/home/theme-toggle.tsx`, `components/marketplace/palette/*`.
- Tokens and component classes live in `app/globals.css` (`--brand`, `--accent-blue`, `--luxury`, `--home-*`). Do not add a second primary color or a new font stack.
- UI primitives (dialog, sheet, select, button, input, alert) are in `components/ui/` (shadcn on Radix).
- The design contract is duplicated per assistant under `.cursor/docs`, `.codex/docs` and `.claude/docs` in the Marketplace repository. Keep them in sync when changing the look.
- The page declares `lang="en"` on the root element. Open Graph and the manifest use `en_PH`.

## Related pages

- [Marketplace overview](/docs/marketplace/overview)
- [Browsing and search](/docs/marketplace/browsing-and-search)
- [Vehicle details](/docs/marketplace/vehicle-details)
- [SEO and sharing](/docs/marketplace/seo-and-sharing)
- [Architecture](/docs/developers/architecture)
