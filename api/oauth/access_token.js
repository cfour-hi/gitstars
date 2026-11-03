export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type',
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

export default async (request, context) => {
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
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return new Response('OK', {
      status: 200,
      headers: CORS_HEADERS,
    });
  }

  let phase = 'parse_request_body';
  try {
    const requestBody = await request.json();
    const usesServerClientSecret = !requestBody.client_secret;

    if (usesServerClientSecret) {
      requestBody.client_secret =
        process.env.GITHUB_CLIENT_SECRET ?? process.env.VITE_GITSTARS_CLIENT_SECRET;
    }

    log('info', 'request.parsed', {
      requestId,
      hasClientId: Boolean(requestBody.client_id),
      hasCode: Boolean(requestBody.code),
      clientSecretSource: usesServerClientSecret ? 'environment' : 'request',
    });

    phase = 'github_token_exchange';
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    log(res.ok && !data.error ? 'info' : 'warn', 'github.response', {
      requestId,
      status: res.status,
      ok: res.ok,
      oauthError: data.error || undefined,
      hasAccessToken: Boolean(data.access_token),
      durationMs: Date.now() - startedAt,
    });

    log('info', 'request.completed', {
      requestId,
      status: 200,
      durationMs: Date.now() - startedAt,
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (e) {
    log('error', 'request.failed', {
      requestId,
      phase,
      errorName: e?.name,
      errorMessage: e?.message || String(e),
      stack: e?.stack,
      durationMs: Date.now() - startedAt,
    });

    return new Response(e.message);
  }
};
