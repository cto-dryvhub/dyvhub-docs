import {createHmac, timingSafeEqual} from 'node:crypto';
import {next} from '@vercel/functions';

const AUTH_PATH = '/_docs-auth';
const LOGOUT_PATH = '/_docs-logout';
const SESSION_VERSION = 'v1';
const SESSION_TTL_SECONDS = 60 * 60;
const MIN_PASSCODE_LENGTH = 12;
const MIN_SECRET_LENGTH = 32;

function getConfig(): {passcode: string; secret: string} | null {
  const passcode = process.env.DOCS_PASSCODE?.trim() ?? '';
  const secret = process.env.DOCS_AUTH_SECRET?.trim() ?? '';
  if (passcode.length < MIN_PASSCODE_LENGTH || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }
  return {passcode, secret};
}

function digest(value: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(value).digest();
}

function secureEqual(left: string, right: string, secret: string): boolean {
  return timingSafeEqual(digest(left, secret), digest(right, secret));
}

function signSession(expiresAt: number, secret: string): string {
  const payload = `${SESSION_VERSION}.${expiresAt}`;
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

function isValidSession(token: string | undefined, secret: string): boolean {
  if (!token) {
    return false;
  }
  const [version, rawExpiry, signature, ...extra] = token.split('.');
  if (extra.length > 0 || version !== SESSION_VERSION || !rawExpiry || !signature) {
    return false;
  }
  const expiresAt = Number(rawExpiry);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = signSession(expiresAt, secret);
  return secureEqual(token, expected, secret);
}

function parseCookies(header: string | null): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const part of (header ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator <= 0) {
      continue;
    }
    cookies.set(part.slice(0, separator).trim(), part.slice(separator + 1).trim());
  }
  return cookies;
}

function cookieName(request: Request): string {
  return new URL(request.url).protocol === 'https:'
    ? '__Host-dryvhub_docs_session'
    : 'dryvhub_docs_session';
}

function sessionCookie(request: Request, value: string, maxAge: number): string {
  const isSecure = new URL(request.url).protocol === 'https:';
  return [
    `${cookieName(request)}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Strict',
    isSecure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.length > 2048) {
    return '/';
  }
  return value;
}

function responseHeaders(): Headers {
  return new Headers({
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy':
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'Content-Type': 'text/html; charset=utf-8',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  });
}

function loginHtml(returnTo: string, hasError = false): string {
  const action = `${AUTH_PATH}?returnTo=${encodeURIComponent(returnTo)}`;
  const error = hasError
    ? '<p class="error" id="passcode-error" role="alert">That passcode is not correct.</p>'
    : '';
  const describedBy = hasError ? ' aria-describedby="passcode-error" aria-invalid="true"' : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DryvHub Guide · Passcode</title>
  <meta name="robots" content="noindex,nofollow,noarchive">
  <style>
    :root {
      --brand: #2563eb;
      --brand-hover: #1d4ed8;
      --ink: #0f172a;
      --muted: #475569;
      --line: #dce6f2;
      --canvas: #ffffff;
      --soft: #eff6ff;
      --danger: #b91c1c;
      color-scheme: light dark;
      font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background:
        radial-gradient(32rem 16rem at 50% -4rem, rgba(37, 99, 235, 0.14), transparent 70%),
        var(--canvas);
      color: var(--ink);
    }
    main { width: min(22rem, 100%); }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      margin: 0 0 1.25rem;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    h1 {
      margin: 0;
      font-size: 1.65rem;
      line-height: 1.15;
      letter-spacing: -0.03em;
    }
    .support {
      margin: 0.55rem 0 1.25rem;
      color: var(--muted);
      font-size: 0.95rem;
      line-height: 1.45;
    }
    form { display: flex; flex-direction: column; gap: 0.45rem; }
    label { font-size: 0.85rem; font-weight: 600; }
    input, button { min-height: 2.75rem; border-radius: 0.5rem; font: inherit; }
    input {
      width: 100%;
      padding: 0.55rem 0.7rem;
      border: 1px solid var(--line);
      background: var(--canvas);
      color: var(--ink);
    }
    input:focus-visible, button:focus-visible {
      outline: 2px solid var(--brand);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.45);
    }
    button {
      margin-top: 0.35rem;
      border: 0;
      background: var(--brand);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover { background: var(--brand-hover); }
    .error { margin: 0.1rem 0 0; color: var(--danger); font-size: 0.9rem; }
    @media (prefers-color-scheme: dark) {
      :root { --ink: #e2e8f0; --muted: #94a3b8; --line: #334155; --canvas: #0f172a; --danger: #fca5a5; }
      body { background: radial-gradient(32rem 16rem at 50% -4rem, rgba(37, 99, 235, 0.28), transparent 70%), var(--canvas); }
    }
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  </style>
</head>
<body>
  <main>
    <p class="brand">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#2563EB"/>
        <path d="M9 9h7.2c4.2 0 7 2.8 7 7s-2.8 7-7 7H9V9Zm3.4 3v8h3.6c2.3 0 3.8-1.6 3.8-4s-1.5-4-3.8-4h-3.6Z" fill="#fff"/>
      </svg>
      DryvHub
    </p>
    <h1>Enter the passcode</h1>
    <p class="support">Internal guide. Access lasts 1 hour, then this page asks again.</p>
    <form method="post" action="${action}">
      <label for="passcode">Passcode</label>
      <input id="passcode" name="passcode" type="password" autocomplete="current-password" minlength="${MIN_PASSCODE_LENGTH}" required autofocus${describedBy}>
      ${error}
      <button type="submit">Continue</button>
    </form>
  </main>
</body>
</html>`;
}

function loginResponse(request: Request, hasError = false): Response {
  const url = new URL(request.url);
  const returnTo =
    url.pathname === AUTH_PATH ? safeReturnTo(url.searchParams.get('returnTo')) : `${url.pathname}${url.search}`;
  return new Response(request.method === 'HEAD' ? null : loginHtml(returnTo, hasError), {
    status: 401,
    headers: responseHeaders(),
  });
}

function configurationError(): Response {
  return new Response('Documentation access is not configured.', {
    status: 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

async function authenticate(request: Request, passcode: string, secret: string): Promise<Response> {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (!Number.isFinite(contentLength) || contentLength > 1024) {
    return loginResponse(request, true);
  }

  let enteredPasscode = '';
  try {
    const form = await request.formData();
    const value = form.get('passcode');
    enteredPasscode = typeof value === 'string' ? value : '';
  } catch {
    return loginResponse(request, true);
  }

  if (!secureEqual(enteredPasscode, passcode, secret)) {
    return loginResponse(request, true);
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get('returnTo'));
  return new Response(null, {
    status: 303,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      Location: returnTo,
      'Set-Cookie': sessionCookie(request, signSession(expiresAt, secret), SESSION_TTL_SECONDS),
    },
  });
}

export default async function middleware(request: Request): Promise<Response> {
  const config = getConfig();
  if (!config) {
    return configurationError();
  }

  const url = new URL(request.url);
  if (url.pathname === LOGOUT_PATH) {
    return new Response(null, {
      status: 303,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        Location: '/',
        'Set-Cookie': sessionCookie(request, '', 0),
      },
    });
  }

  if (url.pathname === AUTH_PATH) {
    return request.method === 'POST'
      ? authenticate(request, config.passcode, config.secret)
      : loginResponse(request);
  }

  const session = parseCookies(request.headers.get('cookie')).get(cookieName(request));
  if (!isValidSession(session, config.secret)) {
    return loginResponse(request);
  }

  return next();
}

export const config = {
  runtime: 'nodejs',
};
