---
title: Facebook Page connect (OAuth)
sidebar_position: 6.5
description: "How a dealer connects a Facebook Page: the single canonical OAuth callback, the session-less relay on app.dryvhub.com, the authenticated exchange on the tenant host, env vars, and error codes."
---

# Facebook Page connect (OAuth)

**What this page covers:** how a dealer connects a Facebook Page from their own tenant subdomain. Facebook always sends the browser back to one canonical callback URL. A small relay on that URL hands the browser back to the dealer's subdomain, and the OAuth code is exchanged there, behind the dealer's own sign-in. The page also lists the env vars for each environment, the redirect URIs registered in the Meta app, the error codes, and the operational limits.

Source of truth: `dryvhub-api/docs/plans/facebook-oauth-canonical-callback.md` and `dryvhub-dealer/docs/adr/0004-facebook-page-connect-listing-sync.md` (see the addendum). Dealer-facing usage is in [Facebook integration](../dealer/facebook-integration.md).

## Why there is one canonical callback

- **Meta accepts only exact redirect URIs.** Every `redirect_uri` must be pre-registered in the Meta app, character for character. Wildcards such as `https://*.dryvhub.com/...` are not allowed, so we cannot register one callback per tenant subdomain.
- **So every connect returns to one host.** In production that host is `https://app.dryvhub.com/dashboard/settings/facebook/callback`. The API reads it only from `FACEBOOK_REDIRECT_URI`. It never derives it from `Host`, `Origin`, `X-Forwarded-Host`, the tenant subdomain, or client input.
- **The canonical host usually has no session.** The dealer's Supabase session is stored in `localStorage` per origin. A dealer signed in on `dealer-a.dryvhub.com` is normally *not* signed in on `app.dryvhub.com`. That is why the callback is a session-less relay, not an authenticated page.

## The flow, step by step

```text
dealer-a.dryvhub.com/dashboard/settings
  │ 1. GET /api/v1/tenants/current/facebook/connect/start          (Bearer, owner)
  ▼
facebook.com/dialog/oauth?redirect_uri=<FACEBOOK_REDIRECT_URI>&state=…
  │ 2. Dealer approves on Facebook
  ▼
app.dryvhub.com/dashboard/settings/facebook/callback?code=…&state=…
  │ 3. proxy.ts rewrite → app/api/facebook/oauth/relay/route.ts  (no session)
  │ 4. POST /api/v1/facebook/oauth/return-target { state }          (public)
  │ 5. Relay re-checks the host, then 303
  ▼
dealer-a.dryvhub.com/dashboard/settings/facebook/complete#code=…&state=…
  │ 6. Page clears the fragment, then
  │    POST /api/v1/tenants/current/facebook/connect/callback        (Bearer, owner)
  │ 7. POST /api/v1/tenants/current/facebook/connect/select           (auto when 1 Page)
  ▼
dealer-a.dryvhub.com/dashboard/settings/facebook
```

1. **Start (tenant host).** The settings page calls `connect/start`. The API signs a v2 `state` and returns an `authorizationUrl` whose `redirect_uri` is exactly `FACEBOOK_REDIRECT_URI`. The state is `base64url(payload).base64url(HMAC-SHA256)`. Its payload is `{ v: 2, tid, sub, nonce, rp, iat, exp }`: the tenant id, the Supabase user id, a 16-byte random nonce, an allowlisted return path (default `/dashboard/settings/facebook`), and a 10-minute expiry.
2. **Facebook.** The browser goes to the Facebook dialog. The dealer picks Pages and approves.
3. **Relay (canonical host).** Facebook redirects to `/dashboard/settings/facebook/callback`. On every host, `proxy.ts` rewrites that path to the Route Handler `app/api/facebook/oauth/relay/route.ts`. No sign-in is needed.
4. **Return target.** The relay sends only the `state` to `POST /api/v1/facebook/oauth/return-target`. The API checks the signature, version, and expiry, then loads the tenant (it must be active). It builds `<tenant origin>/dashboard/settings/facebook/complete` from `FACEBOOK_TENANT_RETURN_ORIGIN_TEMPLATE` and the tenant's **stored** subdomain. The built host must equal `FACEBOOK_TENANT_RETURN_ROOT_DOMAIN` or be a subdomain of it. This endpoint does not consume the nonce, does not exchange the code, and never accepts a host or URL from the client.
5. **Redirect to the tenant.** The relay checks the returned URL a second time, against the dealer's `NEXT_PUBLIC_ROOT_DOMAIN`: `https` only in production, no userinfo, and the path must be `/complete`. `*.localhost` is allowed outside production only. It then responds `303` to `returnUrl#code=…&state=…`, with `Cache-Control: no-store` and `Referrer-Policy: no-referrer`. If Facebook returned an error, the fragment is `#error=access_denied` or `#error=oauth_error`. If the code is missing, it is `#error=missing_code`. Meta's raw `error_description` is never forwarded.
6. **Complete (tenant host, signed in).** `app/(session)/dashboard/settings/facebook/complete/page.tsx` reads the fragment and removes it with `history.replaceState` before any network call. It then posts `{ code, state }` to `connect/callback` with the dealer's Bearer token. The API rejects the request before calling Facebook unless all of these hold: the state is valid and unexpired, `tid` is the current tenant, `sub` is the signed-in user, and the nonce has not been used. It then exchanges the code using the **same** `FACEBOOK_REDIRECT_URI`, caches the eligible Pages under the current tenant, and returns `{ pages, returnPath }`.
7. **Select.** If there is exactly one Page, the dashboard selects it automatically. If there are several, it goes to `/dashboard/settings/facebook?select=1` so the dealer can pick one. `connect/select` accepts only Page ids from the current tenant's pending list. On success, the browser lands on `returnPath` (`/dashboard/settings/facebook`).

The fragment (`#…`) matters: browsers never send it to servers or in the `Referer` header. So the code never appears in server logs, proxies, or analytics.

## Why the code exchange happens on the tenant host

If the canonical callback exchanged the code without a session, an attacker could link a victim's Facebook Pages to the attacker's dealership. This is an OAuth login-CSRF (account-linking) attack:

1. The owner of tenant X starts a connect and copies the Facebook dialog link, which carries X's valid state.
2. They send the link to a victim, and the victim approves.
3. With no sign-in check, the victim's Pages would land in tenant X's pending list.

Running the exchange behind the tenant owner's Bearer token and binding `sub` (the user who started the flow) in the signed state blocks this. Meta only requires the `redirect_uri` value in the exchange to match the one in the dialog. It does not care which host makes the server-side call.

## Environment variables

### API (`dryvhub-api`)

| Variable | Production | Staging | Local |
|---|---|---|---|
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | Required (prod Meta app) | Required | Required (test Meta app) |
| `FACEBOOK_REDIRECT_URI` | `https://app.dryvhub.com/dashboard/settings/facebook/callback` | `https://staging-dealer.dryvhub.com/dashboard/settings/facebook/callback` | `http://localhost:3000/dashboard/settings/facebook/callback` |
| `FACEBOOK_TENANT_RETURN_ORIGIN_TEMPLATE` | Optional, default `https://{subdomain}.dryvhub.com` | `https://staging-dealer.dryvhub.com` (one shared host, no placeholder) | `http://{subdomain}.localhost:3000` |
| `FACEBOOK_TENANT_RETURN_ROOT_DOMAIN` | Optional, default `dryvhub.com` | `dryvhub.com` | `localhost` |
| `FACEBOOK_OAUTH_STATE_SECRET` | Set a dedicated random value (32+ bytes) | Set | Optional (falls back to `FACEBOOK_APP_SECRET`) |
| `FACEBOOK_GRAPH_API_VERSION` | Optional, default `v26.0` | Same | Same |

All of these are read by one provider, `src/services/facebook/facebook-oauth.config.ts`. It fails closed: a missing required variable returns `503 FACEBOOK_NOT_CONFIGURED`, and the message names the variable but never its value. When `NODE_ENV=production`, it also rejects a `FACEBOOK_REDIRECT_URI` that is not `https`, that points at `localhost`, `127.0.0.1`, or `*.localhost`, or whose path is not `/dashboard/settings/facebook/callback`. It applies the same `https` and localhost checks to the return template and the root domain.

### Dealer (`dryvhub-dealer`)

| Variable | Production | Staging | Local |
|---|---|---|---|
| `NEXT_PUBLIC_ROOT_DOMAIN` | `dryvhub.com` | `dryvhub.com` | `localhost` or unset |

The dealer never builds `redirect_uri` itself; it only follows the `authorizationUrl` the API returns. `NEXT_PUBLIC_ROOT_DOMAIN` is the relay's independent host check (step 5). No other dealer variable is needed for this flow. The general variable reference is [Environment variables](./environment-variables.md).

## Meta app redirect URIs

Register these under **Facebook Login → Settings → Valid OAuth Redirect URIs**, exactly as written:

| Meta app | Valid OAuth Redirect URIs |
|---|---|
| Production app | `https://app.dryvhub.com/dashboard/settings/facebook/callback` and `https://staging-dealer.dryvhub.com/dashboard/settings/facebook/callback` |
| Test app (local) | `http://localhost:3000/dashboard/settings/facebook/callback` |

Wildcards are not allowed. Per-tenant URLs such as `https://dealer-a.dryvhub.com/...` are never needed, because tenants are reached through the relay.

## Error codes

API errors use the body `{ code, message }`, and `message` is always user-safe. The relay and the completion page map codes to friendly copy, and every error screen offers **Back to Settings** or **Return to DryvHub**.

| Code | HTTP | Where | Meaning | User action |
|---|---|---|---|---|
| `FACEBOOK_NOT_CONFIGURED` | 503 | start, return-target, callback | Required env var missing, or an unsafe production URL | Contact support (ops must fix the config) |
| `FACEBOOK_STATE_INVALID` | 400 | return-target, callback | Bad signature, malformed state, or wrong version (including v1) | Start the connect again |
| `FACEBOOK_STATE_EXPIRED` | 400 | return-target, callback | More than 10 minutes since start | Start the connect again |
| `FACEBOOK_TENANT_NOT_FOUND` | 404 | return-target | Tenant missing or inactive | Contact support |
| `FACEBOOK_RETURN_HOST_REJECTED` | 500 | return-target (and the relay's own host check) | Built return host is outside the allowed root domain; logged | Contact support (ops must fix the template) |
| `FACEBOOK_STATE_TENANT_MISMATCH` | 403 | callback | State was started by another user or dealership | Sign in to the dealership that started it, then start again |
| `FACEBOOK_STATE_REPLAYED` | 400 | callback | Nonce already used (link reused or refreshed) | Start the connect again |
| `FACEBOOK_NO_ELIGIBLE_PAGES` | 400 | callback | No Pages with permission to post | Grant the Page permissions on Facebook, then retry |
| `FACEBOOK_TOKEN_EXCHANGE_FAILED` | 503 | callback | Facebook rejected the code exchange | Try again |
| `FACEBOOK_PAGES_FETCH_FAILED` | 503 | callback | Could not load the dealer's Pages from Graph | Try again |

The relay sends errors to the public page `/facebook/connect-error?reason=…`. The reasons are `invalid_state`, `expired_state`, `tenant_not_found`, `not_configured`, `return_host_rejected`, and `unavailable`. On the tenant host, the fragment errors `access_denied`, `oauth_error`, and `missing_code` are shown on the completion page.

## Operational notes

- **Single-instance limit.** The nonce store and the pending-Pages cache are in-memory, per API process. With more than one API instance, a replayed state could be accepted, or `connect/select` could miss the cache and ask the dealer to start again. Move both to shared storage (for example Render Key Value) before scaling the API horizontally.
- **In-flight v1 states after deploy.** States signed before the v2 release are rejected with `FACEBOOK_STATE_INVALID`. Dealers who were mid-connect see "start again" copy. The flow takes seconds, so the impact is minimal.
- **Logging.** The API and the relay log only `stage` (`start`, `return-target`, `callback`, `exchange`, `me-accounts`, `select`), `tenantId` when known, the error code, Meta's HTTP status or `error.code`, and the callback host from config. Never log the app secret, the state secret, access tokens, the authorization `code`, the raw `state`, or full URLs.
- **Public endpoint.** `return-target` is `@Public()`, limits `state` to 2048 characters, and reveals nothing without a validly signed state. There is no rate limiting yet.
- **Staging check before production.** From a staging tenant, confirm the dialog URL's `redirect_uri` is the staging value. Then finish the flow and check that the Page is connected to the right tenant.
