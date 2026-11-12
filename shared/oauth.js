// Shared OAuth token-exchange logic for the two Gitstars backends:
//   * docker/server.js        - Node.js HTTPS static server
//   * api/oauth/access_token.js - Vercel edge function
//
// This module is deliberately runtime-agnostic. It only relies on web-standard
// globals that exist in both Node.js (>= 20) and edge runtimes (fetch,
// TextEncoder, AbortSignal, process.env), so it must never import a `node:`
// builtin. Platform-specific HTTP plumbing stays in the respective wrappers.

/** CORS headers for the token-exchange endpoint. */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Largest accepted token-exchange request body, in bytes. */
export const MAX_REQUEST_SIZE = 16 * 1024;

export const GITHUB_TOKEN_ENDPOINT =
  'https://github.com/login/oauth/access_token';

/** Timeout for the upstream GitHub token exchange. */
export const UPSTREAM_TIMEOUT_MS = 10_000;

const MAX_CODE_LENGTH = 512;
const MAX_CLIENT_ID_LENGTH = 256;

/**
 * JSON response headers shared by both backends, including the no-store cache
 * directive and the CORS headers above.
 */
export function jsonResponseHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...CORS_HEADERS,
    ...extraHeaders,
  };
}

/**
 * Returns the configured GitHub OAuth client secret. The documented name is
 * GITHUB_CLIENT_SECRET; VITE_GITSTARS_CLIENT_SECRET is kept as a fallback for
 * older deployments.
 */
export function getClientSecret(environment = globalThis.process?.env) {
  if (!environment) return undefined;
  return (
    environment.GITHUB_CLIENT_SECRET ||
    environment.VITE_GITSTARS_CLIENT_SECRET ||
    undefined
  );
}

function errorResponse(status, error) {
  return { ok: false, status, body: { error } };
}

/**
 * Validates a parsed token-exchange request body.
 *
 * @returns {{ok: true, value: {code: string, clientId: string}}
 *   | {ok: false, status: number, body: {error: string}}}
 */
export function validateTokenRequest(body) {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    typeof body.code !== 'string' ||
    typeof body.client_id !== 'string' ||
    body.code.length > MAX_CODE_LENGTH ||
    body.client_id.length > MAX_CLIENT_ID_LENGTH
  ) {
    return errorResponse(400, 'invalid_request');
  }

  return { ok: true, value: { code: body.code, clientId: body.client_id } };
}

/**
 * Parses and validates a raw token-exchange request body.
 *
 * The size limit is checked before parsing so oversized bodies are rejected
 * consistently on both backends.
 *
 * @returns {{ok: true, value: {code: string, clientId: string}}
 *   | {ok: false, status: number, body: {error: string}}}
 */
export function parseTokenRequest(rawBody) {
  if (typeof rawBody !== 'string') {
    return errorResponse(400, 'invalid_json');
  }

  if (new TextEncoder().encode(rawBody).length > MAX_REQUEST_SIZE) {
    return errorResponse(413, 'request_too_large');
  }

  let parsed;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, 'invalid_json');
  }

  return validateTokenRequest(parsed);
}

/**
 * Exchanges a GitHub OAuth authorization code for an access token.
 *
 * Resolves to `{status, body}` where `body` is the upstream response text,
 * untouched, and `status` is the upstream HTTP status. Upstream error payloads
 * are therefore passed through verbatim; callers only need to map network
 * failures/timeouts to their own error response.
 */
export async function exchangeCodeForToken({
  code,
  clientId,
  clientSecret,
  userAgent = 'gitstars',
  fetchImplementation = globalThis.fetch,
  timeoutMs = UPSTREAM_TIMEOUT_MS,
}) {
  if (typeof fetchImplementation !== 'function') {
    throw new TypeError('fetch is not available in this runtime');
  }

  const response = await fetchImplementation(GITHUB_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
    body: JSON.stringify({
      code,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  return { status: response.status, body: await response.text() };
}
