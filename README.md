# DryvHub Docs

Internal guide for DryvHub Dealer and DryvHub Marketplace, built with [Docusaurus](https://docusaurus.io/docs).

```bash
npm install
npm start        # protected Vercel dev server (downloads the pinned CLI)
npm run build    # static site in build/ (fails on broken links)
```

Sections live in `docs/start`, `docs/executive`, `docs/dealer`, `docs/marketplace`, `docs/developers`. Each folder is one sidebar; order pages with `sidebar_position`. See `docs/developers/contributing-to-docs.md`.

Copy `.env.example` to `.env` and set:

- `DOCS_PASSCODE` — a unique passphrase with at least 12 characters.
- `DOCS_AUTH_SECRET` — an independent random signing key (`openssl rand -base64 48`).

Authentication runs in Vercel Routing Middleware **before** every HTML, JavaScript, JSON, search-index, image, error, `HEAD`, or range request. A correct passcode creates an 8-hour, HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Strict` cookie. Neither the passcode nor a reusable verifier is built into the browser bundle.

For deployment, add both secrets to the Vercel project's **Production and Preview** environment variables. Do not rely on the local `.env`; Vercel does not upload it.

In Vercel Firewall, rate-limit `POST /_docs-auth` by IP (for example 5 attempts per minute) and publish the rule after testing it in log/preview mode. Old deployments created before the middleware existed must be deleted because their deployment URLs remain public.

Optional env: `DOCS_SITE_URL`, `DOCS_BASE_URL` (for deployment).
