import {createHmac, timingSafeEqual} from 'node:crypto';
import {next} from '@vercel/functions';

const AUTH_PATH = '/_docs-auth';
const LOGOUT_PATH = '/_docs-logout';
const SESSION_VERSION = 'v1';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
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
    ? '<p class="error" role="alert">That passcode is not correct.</p>'
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DryvHub Guide · Sign in</title>
  <meta name="robots" content="noindex,nofollow,noarchive">
  <style>
    :root{color-scheme:light dark;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
    *{box-sizing:border-box}body{margin:0;background:#fff;color:#0f172a}
    main{max-width:24rem;margin:0 auto;padding:4.5rem 1.25rem 3rem}
    .eyebrow{margin:0 0 .4rem;color:#2563eb;font-size:.75rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
    h1{margin:0 0 1rem;font-size:1.6rem;letter-spacing:-.03em}
    form{display:flex;flex-direction:column;align-items:flex-start;gap:.45rem}
    label{font-size:.85rem;font-weight:600}input{width:100%;padding:.5rem .65rem;border:1px solid #dce6f2;border-radius:.5rem;background:#fff;color:#0f172a;font:inherit}
    input:focus-visible,button:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
    button{padding:.5rem .85rem;border:0;border-radius:.5rem;background:#2563eb;color:#fff;font:600 .9rem/1.2 inherit;cursor:pointer}
    button:hover{background:#1d4ed8}.error{margin:.15rem 0 .35rem;color:#b91c1c;font-size:.9rem}
    @media(prefers-color-scheme:dark){body,input{background:#0f172a;color:#e2e8f0}input{border-color:#334155}}
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">DryvHub · Internal guide</p>
    <h1>Enter the passcode</h1>
    <form method="post" action="${action}">
      <label for="passcode">Passcode</label>
      <input id="passcode" name="passcode" type="password" autocomplete="current-password" minlength="${MIN_PASSCODE_LENGTH}" required autofocus>
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
