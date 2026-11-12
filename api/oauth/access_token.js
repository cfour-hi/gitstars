import {
  CORS_HEADERS,
  exchangeCodeForToken,
  getClientSecret,
  jsonResponseHeaders,
  parseTokenRequest,
} from '../../shared/oauth.js';

export const config = {
  runtime: 'edge',
};

const log = (level, event, details = {}) => {
  console[level](
    JSON.stringify({
      service: 'oauth-access-token',
      event,
      ...details,
    }),
  );
};

const jsonResponse = (status, body, extraHeaders = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: jsonResponseHeaders(extraHeaders),
  });

// The upstream response body is forwarded verbatim, so a token response and a
// GitHub error payload both keep their exact wire format.
const passthroughResponse = ({ status, body }) =>
  new Response(body, { status, headers: jsonResponseHeaders() });

const parseJsonSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

export default async (request) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  log('info', 'request.received', {
    requestId,
    method: request.method,
    vercelRequestId: request.headers.get('x-vercel-id') || undefined,
  });

  if (request.method === 'OPTIONS') {
    log('info', 'request.completed', {
      requestId,
      status: 204,
      durationMs: Date.now() - startedAt,
    });

    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      405,
      { error: 'method_not_allowed' },
      { Allow: 'OPTIONS, POST' },
    );
  }

  const clientSecret = getClientSecret();

  if (!clientSecret) {
    log('error', 'request.failed', {
      requestId,
      phase: 'configuration',
      errorMessage: 'GITHUB_CLIENT_SECRET is not configured',
    });

    return jsonResponse(503, { error: 'oauth_not_configured' });
  }

  let rawBody;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  const parsed = parseTokenRequest(rawBody);

  if (!parsed.ok) {
    return jsonResponse(parsed.status, parsed.body);
  }

  log('info', 'request.parsed', {
    requestId,
    hasClientId: Boolean(parsed.value.clientId),
    hasCode: Boolean(parsed.value.code),
    clientSecretSource: 'environment',
  });

  const phase = 'github_token_exchange';

  try {
    const upstream = await exchangeCodeForToken({
      code: parsed.value.code,
      clientId: parsed.value.clientId,
      clientSecret,
      userAgent: 'gitstars-vercel',
    });
    const upstreamOk = upstream.status >= 200 && upstream.status < 300;
    const data = parseJsonSafely(upstream.body);

    log(upstreamOk && !data?.error ? 'info' : 'warn', 'github.response', {
      requestId,
      status: upstream.status,
      ok: upstreamOk,
      oauthError: data?.error || undefined,
      hasAccessToken: Boolean(data?.access_token),
      durationMs: Date.now() - startedAt,
    });

    log('info', 'request.completed', {
      requestId,
      status: upstream.status,
      durationMs: Date.now() - startedAt,
    });

    // Pass the upstream status and body through unchanged.
    return passthroughResponse(upstream);
  } catch (error) {
    log('error', 'request.failed', {
      requestId,
      phase,
      errorName: error?.name,
      errorMessage: error?.message || String(error),
      stack: error?.stack,
      durationMs: Date.now() - startedAt,
    });

    return jsonResponse(502, { error: 'oauth_upstream_error' });
  }
};
