import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORS_HEADERS,
  MAX_REQUEST_SIZE,
  exchangeCodeForToken,
  getClientSecret,
  jsonResponseHeaders,
  parseTokenRequest,
  validateTokenRequest,
} from '../shared/oauth.js';

test('getClientSecret prefers GITHUB_CLIENT_SECRET and falls back', () => {
  assert.equal(
    getClientSecret({
      GITHUB_CLIENT_SECRET: 'a',
      VITE_GITSTARS_CLIENT_SECRET: 'b',
    }),
    'a',
  );
  assert.equal(getClientSecret({ VITE_GITSTARS_CLIENT_SECRET: 'b' }), 'b');
  assert.equal(getClientSecret({}), undefined);
  assert.equal(getClientSecret(undefined), undefined);
});

test('jsonResponseHeaders includes no-store and CORS headers', () => {
  const headers = jsonResponseHeaders({ Allow: 'OPTIONS, POST' });
  assert.equal(headers['Cache-Control'], 'no-store');
  assert.equal(headers['Content-Type'], 'application/json; charset=utf-8');
  assert.equal(headers.Allow, 'OPTIONS, POST');
  assert.deepEqual(
    headers['Access-Control-Allow-Origin'],
    CORS_HEADERS['Access-Control-Allow-Origin'],
  );
});

test('validateTokenRequest accepts a valid body', () => {
  assert.deepEqual(validateTokenRequest({ code: 'c', client_id: 'id' }), {
    ok: true,
    value: { code: 'c', clientId: 'id' },
  });
});

test('validateTokenRequest rejects malformed bodies', () => {
  for (const body of [
    null,
    undefined,
    'string',
    [],
    {},
    { code: 1, client_id: 'id' },
    { code: 'c' },
    { code: 'x'.repeat(513), client_id: 'id' },
    { code: 'c', client_id: 'x'.repeat(257) },
  ]) {
    const result = validateTokenRequest(body);
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.equal(result.body.error, 'invalid_request');
  }
});

test('parseTokenRequest rejects invalid JSON and oversized bodies', () => {
  assert.equal(parseTokenRequest('{oops').body.error, 'invalid_json');
  assert.equal(parseTokenRequest(undefined).body.error, 'invalid_json');

  const oversized = JSON.stringify({
    code: 'x'.repeat(MAX_REQUEST_SIZE),
    client_id: 'id',
  });
  const result = parseTokenRequest(oversized);
  assert.equal(result.ok, false);
  assert.equal(result.status, 413);
  assert.equal(result.body.error, 'request_too_large');
});

test('parseTokenRequest parses and validates valid bodies', () => {
  const result = parseTokenRequest(
    JSON.stringify({ code: 'c', client_id: 'id' }),
  );
  assert.deepEqual(result, { ok: true, value: { code: 'c', clientId: 'id' } });
});

test('exchangeCodeForToken forwards request and upstream response', async () => {
  let captured;
  const fetchImplementation = async (url, options) => {
    captured = { url, options };
    return {
      status: 418,
      text: async () => '{"error":"teapot"}',
    };
  };

  const result = await exchangeCodeForToken({
    code: 'abc',
    clientId: 'client',
    clientSecret: 'secret',
    userAgent: 'gitstars-test',
    fetchImplementation,
  });

  assert.equal(captured.url, 'https://github.com/login/oauth/access_token');
  assert.equal(captured.options.method, 'POST');
  assert.equal(captured.options.headers.Accept, 'application/json');
  assert.equal(captured.options.headers['Content-Type'], 'application/json');
  assert.equal(captured.options.headers['User-Agent'], 'gitstars-test');
  assert.deepEqual(JSON.parse(captured.options.body), {
    code: 'abc',
    client_id: 'client',
    client_secret: 'secret',
  });
  assert.ok(captured.options.signal instanceof AbortSignal);
  assert.deepEqual(result, { status: 418, body: '{"error":"teapot"}' });
});

test('exchangeCodeForToken propagates network errors', async () => {
  const fetchImplementation = async () => {
    throw new Error('network down');
  };

  await assert.rejects(
    exchangeCodeForToken({
      code: 'c',
      clientId: 'id',
      clientSecret: 'secret',
      fetchImplementation,
    }),
    /network down/,
  );
});
