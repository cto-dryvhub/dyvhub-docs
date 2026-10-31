import assert from 'node:assert/strict';
import {before, test} from 'node:test';

import middleware from './middleware';

const PASSCODE = 'correct horse battery staple';
const AUTH_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';
const ORIGIN = 'https://docs.example.com';

before(() => {
  process.env.DOCS_PASSCODE = PASSCODE;
  process.env.DOCS_AUTH_SECRET = AUTH_SECRET;
});

function loginRequest(passcode: string, returnTo = '/docs/start/welcome'): Request {
  const url = new URL('/_docs-auth', ORIGIN);
  url.searchParams.set('returnTo', returnTo);
  return new Request(url, {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({passcode}),
  });
}

test('shows the branded passcode page before any content', async () => {
  const response = await middleware(new Request(`${ORIGIN}/docs/start/welcome`));
  const html = await response.text();

  assert.equal(response.status, 401);
  assert.match(html, /DryvHub/);
  assert.match(html, /Enter the passcode/);
  assert.match(html, /lasts 1 hour/);
  assert.match(html, /<label for="passcode">/);
});

test('blocks HTML, assets, search, HEAD and range requests without a session', async () => {
  const cases: Request[] = [
    new Request(`${ORIGIN}/docs/start/welcome`),
    new Request(`${ORIGIN}/assets/app.js`),
    new Request(`${ORIGIN}/search-index.json`),
    new Request(`${ORIGIN}/missing`, {method: 'HEAD'}),
    new Request(`${ORIGIN}/img/logo.svg`, {headers: {Range: 'bytes=0-10'}}),
  ];

  for (const request of cases) {
    const response = await middleware(request);
    assert.equal(response.status, 401);
    assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
  }
});

test('rejects an invalid passcode without creating a cookie', async () => {
  const response = await middleware(loginRequest('wrong-password'));
  assert.equal(response.status, 401);
  assert.equal(response.headers.has('set-cookie'), false);
});

test('rejects an oversized login request', async () => {
  const response = await middleware(
    new Request(`${ORIGIN}/_docs-auth`, {
      method: 'POST',
      headers: {
        'content-length': '2048',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({passcode: PASSCODE}),
    }),
  );
  assert.equal(response.status, 401);
  assert.equal(response.headers.has('set-cookie'), false);
});

test('creates a secure signed session for the correct passcode', async () => {
  const response = await middleware(loginRequest(PASSCODE));
  const cookie = response.headers.get('set-cookie') ?? '';

  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/docs/start/welcome');
  assert.match(cookie, /Max-Age=3600/);
  const expiresAt = Number(cookie.split('=')[1]?.split('.')[1]);
  assert.ok(Math.abs(expiresAt - Math.floor(Date.now() / 1000) - 3600) < 5);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\//);
});

test('accepts a valid session and rejects a modified session', async () => {
  const login = await middleware(loginRequest(PASSCODE));
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];

  const allowed = await middleware(
    new Request(`${ORIGIN}/assets/app.js`, {headers: {cookie}}),
  );
  assert.equal(allowed.headers.get('x-middleware-next'), '1');

  const rejected = await middleware(
    new Request(`${ORIGIN}/assets/app.js`, {headers: {cookie: `${cookie}x`}}),
  );
  assert.equal(rejected.status, 401);
});

test('does not redirect to an external host after login', async () => {
  const response = await middleware(loginRequest(PASSCODE, '//attacker.example'));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/');
});

test('logout expires the session cookie', async () => {
  const response = await middleware(new Request(`${ORIGIN}/_docs-logout`));
  assert.equal(response.status, 303);
  assert.match(response.headers.get('set-cookie') ?? '', /Max-Age=0/);
});
