---
title: Testing
sidebar_position: 10
description: "Jest, Vitest, and Playwright setups, commands, what every change must cover, the E2E page-object pattern, and pre-PR verification per repo."
---

# Testing

**What this page covers:** which test tools each repo uses, how to run them, what behavior every change must cover, how the Playwright E2E suite is organized, and the checklist to run before opening a pull request.

:::tip[In plain English]
A test is a small program that checks another program still behaves correctly. We keep **fast unit tests** that need nothing (no database, no internet) and run them constantly. We add **browser (E2E) tests** only for important user journeys, using fake API responses so they do not depend on a live backend. Ask of each test: "what would break for a user if this test failed?" If the answer is "nothing", delete the test.
:::

## Tools at a glance

| Repo | Unit and integration | Browser (E2E) | Config |
| ---- | -------------------- | ------------- | ------ |
| `dryvhub-api` | **Jest** with `ts-jest`, Node environment, about 130 `*.spec.ts` files next to the code (`src/**/*.spec.ts`) | None | `jest.config.ts` (`rootDir: src`) |
| `dryvhub-dealer` | **Vitest** (`*.test.ts(x)`, `e2e/**` excluded) | **Playwright** under `e2e/` | `vitest.config.ts`, `playwright.config.ts` |
| `dryvhub-marketplace` | **Vitest** (`*.test.ts` colocated with lib, hooks, services) | None yet (**Planned**, only when a plan requires it) | `vitest.config.mts` |

## Commands

| Repo | Command | What it does |
| ---- | ------- | ------------ |
| API | `npx jest` or `npm test` | Run all specs |
| API | `npm run test:watch` | Watch mode |
| API | `npx jest path/to/file.spec.ts` | One file |
| API | `npx tsc --noEmit` | Type-check without building |
| Dealer | `npm test` | Vitest, run once |
| Dealer | `npm run lint` | ESLint |
| Dealer | `npx tsc --noEmit` | Type-check |
| Dealer | `npm run test:e2e` | Playwright (starts `npm run dev` automatically unless a server is already running locally) |
| Dealer | `npm run test:e2e:ui` | Playwright UI mode |
| Dealer | `npm run test:e2e:report` | Open the last HTML report |
| Dealer | `npx next build` | Required when touching layouts, providers, or `next.config.ts` |
| Marketplace | `npm test`, `npm run test:watch` | Vitest |
| Marketplace | `npm run lint`, `npx tsc --noEmit` | Lint and type-check |

Playwright details: Chromium only, `fullyParallel`, retries once and runs one worker on CI, traces on first retry, screenshots and video kept on failure. The base URL defaults to `http://localhost:3000` and can be overridden with `PLAYWRIGHT_BASE_URL`.

:::note
Playwright launches the dev server, which needs the dealer `.env.local` values to start. Specs stub the API and Supabase session, so they do not need a running `dryvhub-api` or a real Supabase account.
:::

## What to cover

For each feature or fix:

| Area | Required coverage |
| ---- | ----------------- |
| Use-cases (API) | Unit tests for success, rule violations, and not-found paths using fake data-service ports (no Prisma, no network) |
| Controllers (API) | Controller specs when route behavior changes: status codes, DTO validation failures, mapping |
| **Tenant scoping** (API) | Another tenant's id returns 404 or 403; queries receive the tenant from context, never from input |
| **Auth** (API) | Protected routes reject missing or invalid tokens; `@Public()` routes stay public only when intended; admin routes reject non-admins |
| **Negative paths** (all) | Not found, unauthorized, forbidden, validation failure, upstream failure (S3, Mongo, Facebook down) |
| Pure helpers (frontends) | Vitest for `lib/` functions: formatting, query mapping, SEO builders, copy rules |
| Services (frontends) | Vitest with a stubbed `fetch`: correct path, method, headers, zod parsing, error mapping |
| Hooks (frontends) | Key logic such as query-key matching or loading semantics |
| UI journeys (dealer) | Playwright only when acceptance criteria need a browser flow |

Rules of thumb:

- Unit tests must pass with **no real resources**: no network, no database, no cloud credentials. Any developer should run them on a fresh clone.
- Mock at module boundaries (ports in the API, `fetch` in frontends), not inside the code under test.
- Golden-style tests suit stable outputs (serializers, SEO JSON-LD, query-string builders).
- Do not add tests only to raise a coverage number.
- If an environment blocker (database, auth) prevents a check, document the exact blocker and what you validated instead.

## Playwright layout (dealer)

```text
e2e/
  flows/       *.spec.ts  one file per user journey
  pages/       *.page.ts  page objects (locators + actions)
  helpers/     mock-api.ts, mock-auth.ts, mock-otp.ts, mock-plate-api.ts, test-data.ts
  fixtures/    small files for upload tests (business permit PDF, showroom photo)
```

Current flows cover signup (happy path, terms, OTP failures), sign-in, onboarding (guard, upload, submit), dashboard stage badge, dealer access, inventory record sale, listings publish and Facebook bump, financials summary, inquiries and cashback, plate check, public dealer profile, storage, verification, billing page, and the admin dashboard.

### Page Object Model (POM)

A **page object** wraps one screen so specs read like user intent and selectors live in one place.

```ts
// e2e/pages/login.page.ts (shape, simplified)
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/dealer/login")
  }

  async signIn(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email)
    await this.page.getByLabel("Password").fill(password)
    await this.page.getByRole("button", { name: "Sign in" }).click()
  }
}
```

```ts
// e2e/flows/signin-existing-dealer.spec.ts (shape, simplified)
test("existing dealer lands on the dashboard", async ({ page }) => {
  await mockAuth(page)         // fake Supabase session
  await mockApi(page)          // fake /api/v1 responses
  const login = new LoginPage(page)
  await login.goto()
  await login.signIn("dealer@example.com", "<password>")
  await expect(page).toHaveURL(/dashboard/)
})
```

The snippets show the pattern, not the exact current code.

Rules:

- Prefer `getByRole`, `getByLabel`, and `getByTestId`; avoid deep CSS selectors.
- Rely on Playwright auto-waiting. Do not use `page.waitForTimeout()`.
- Assert outcomes users see, not implementation details.
- Add `data-testid` only when role or label is not enough.
- Mock network and auth through the helpers instead of calling real services.

## Verification before a pull request

Run the block for each repo you touched.

### `dryvhub-api`

```bash
npx jest
npx tsc --noEmit
# schema changed?
npx prisma generate
```

### `dryvhub-dealer`

```bash
npm run lint
npm test
npx tsc --noEmit
npm run test:e2e   # when UI flows change
npx next build     # when touching layouts, providers, or next.config
```

After layout, provider, or bundle changes, record First Load JS for `/`, `/legal/privacy`, and `/dashboard` in your notes.

### `dryvhub-marketplace`

```bash
npm run lint
npx tsc --noEmit
npm test
```

Then exercise home, `/vehicles`, details, filters, and inquiry in a browser if you touched them.

### Definition of done (from the repo contracts)

- Every acceptance criterion in the plan is implemented and covered.
- Review reports zero Critical findings.
- Architecture and security rules hold (see [Conventions](/docs/developers/conventions)).
- Required migration and Prisma regeneration steps are done or explicitly documented.

## Related pages

- [Adding a feature](/docs/developers/adding-a-feature)
- [Conventions](/docs/developers/conventions)
- [Dealer app internals](/docs/developers/dealer-app-internals)
- [Marketplace internals](/docs/developers/marketplace-internals)
