import { createReadStream, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CORS_HEADERS,
  MAX_REQUEST_SIZE,
  exchangeCodeForToken,
  getClientSecret,
  parseTokenRequest,
} from '../shared/oauth.js';

const host = process.env.HOST || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '8080', 10);
const tlsCertificateFile = process.env.TLS_CERT_FILE;
const tlsKeyFile = process.env.TLS_KEY_FILE;
const tlsEnabled = Boolean(tlsCertificateFile && tlsKeyFile);
const distDirectory = resolve(
  fileURLToPath(new URL('../dist/', import.meta.url)),
);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

async function readRequestBody(request) {
  let size = 0;
  const chunks = [];

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST_SIZE) {
      throw new Error('REQUEST_TOO_LARGE');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function handleTokenExchange(request, response) {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, CORS_HEADERS);
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(
      response,
      405,
      { error: 'method_not_allowed' },
      {
        ...CORS_HEADERS,
        Allow: 'OPTIONS, POST',
      },
    );
    return;
  }

  const clientSecret = getClientSecret();
  if (!clientSecret) {
    console.error('GITHUB_CLIENT_SECRET is not configured');
    sendJson(response, 503, { error: 'oauth_not_configured' }, CORS_HEADERS);
    return;
  }

  try {
    const parsed = parseTokenRequest(await readRequestBody(request));
    if (!parsed.ok) {
      sendJson(response, parsed.status, parsed.body, CORS_HEADERS);
      return;
    }

    const githubResponse = await exchangeCodeForToken({
      code: parsed.value.code,
      clientId: parsed.value.clientId,
      clientSecret,
      userAgent: 'gitstars-docker',
    });

    response.writeHead(githubResponse.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    });
    response.end(githubResponse.body);
  } catch (error) {
    if (error.message === 'REQUEST_TOO_LARGE') {
      sendJson(response, 413, { error: 'request_too_large' }, CORS_HEADERS);
      return;
    }

    console.error('GitHub OAuth token exchange failed:', error.message);
    sendJson(response, 502, { error: 'oauth_upstream_error' }, CORS_HEADERS);
  }
}

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function stripWeakEtag(etag) {
  return etag.startsWith('W/') ? etag.slice(2) : etag;
}

// Both validator headers are compared with the representation metadata from
// `stat()`. If-None-Match takes precedence over If-Modified-Since, as required
// by RFC 9110 section 13.1.3.
function isNotModified(request, etag, lastModifiedMs) {
  const ifNoneMatch = request.headers['if-none-match'];

  if (ifNoneMatch !== undefined) {
    const normalizedEtag = stripWeakEtag(etag);
    return ifNoneMatch
      .split(',')
      .map((entry) => entry.trim())
      .some(
        (entry) => entry === '*' || stripWeakEtag(entry) === normalizedEtag,
      );
  }

  const ifModifiedSince = request.headers['if-modified-since'];

  if (ifModifiedSince !== undefined) {
    const modifiedSince = Date.parse(ifModifiedSince);
    if (!Number.isNaN(modifiedSince)) {
      // HTTP dates have second precision, so compare whole seconds.
      return (
        Math.floor(lastModifiedMs / 1000) <= Math.floor(modifiedSince / 1000)
      );
    }
  }

  return false;
}

async function sendFile(request, response, filePath) {
  const fileStat = await stat(filePath);
  if (!fileStat.isFile()) throw new Error('NOT_A_FILE');

  const extension = extname(filePath).toLowerCase();
  const isIndex = filePath === resolve(distDirectory, 'index.html');
  const isHashedAsset = filePath.startsWith(
    `${resolve(distDirectory, 'assets')}${sep}`,
  );
  const etag = `W/"${fileStat.size.toString(16)}-${Math.floor(
    fileStat.mtimeMs,
  ).toString(16)}"`;
  const lastModified = new Date(fileStat.mtimeMs).toUTCString();

  const headers = {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': isIndex
      ? 'no-cache'
      : isHashedAsset
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=3600',
    ETag: etag,
    'Last-Modified': lastModified,
    ...securityHeaders,
  };

  if (isNotModified(request, etag, fileStat.mtimeMs)) {
    response.writeHead(304, headers);
    response.end();
    return;
  }

  headers['Content-Length'] = fileStat.size;
  response.writeHead(200, headers);

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  const stream = createReadStream(filePath);
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
}

async function handleStatic(request, response, pathname) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(
      response,
      405,
      { error: 'method_not_allowed' },
      {
        Allow: 'GET, HEAD',
      },
    );
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: 'invalid_path' });
    return;
  }

  const requestedFile = resolve(distDirectory, `.${decodedPath}`);
  if (
    requestedFile !== distDirectory &&
    !requestedFile.startsWith(`${distDirectory}${sep}`)
  ) {
    sendJson(response, 403, { error: 'forbidden' });
    return;
  }

  try {
    await sendFile(request, response, requestedFile);
  } catch {
    if (extname(decodedPath)) {
      sendJson(response, 404, { error: 'not_found' });
      return;
    }

    try {
      await sendFile(request, response, resolve(distDirectory, 'index.html'));
    } catch {
      sendJson(response, 404, { error: 'not_found' });
    }
  }
}

if (Boolean(tlsCertificateFile) !== Boolean(tlsKeyFile)) {
  throw new Error('TLS_CERT_FILE and TLS_KEY_FILE must be configured together');
}

const handleRequest = async (request, response) => {
  try {
    // Do not build the base URL from the client-supplied Host header: an
    // invalid Host value would make `new URL` throw and crash the process.
    const url = new URL(request.url || '/', 'http://localhost');

    if (url.pathname === '/healthz') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        sendJson(
          response,
          405,
          { error: 'method_not_allowed' },
          { Allow: 'GET, HEAD' },
        );
        return;
      }

      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (url.pathname === '/api/oauth/access_token') {
      await handleTokenExchange(request, response);
      return;
    }

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      sendJson(response, 404, { error: 'not_found' });
      return;
    }

    await handleStatic(request, response, url.pathname);
  } catch (error) {
    console.error('Request handling failed:', error);

    if (response.headersSent) {
      response.destroy();
      return;
    }

    sendJson(response, 500, { error: 'internal_error' });
  }
};

const server = tlsEnabled
  ? createHttpsServer(
      {
        cert: readFileSync(tlsCertificateFile),
        key: readFileSync(tlsKeyFile),
      },
      handleRequest,
    )
  : createHttpServer(handleRequest);

server.listen(port, host, () => {
  const protocol = tlsEnabled ? 'https' : 'http';
  console.log(`Gitstars is listening on ${protocol}://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
