# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_GITSTARS_CLIENT_ID
ENV VITE_GITSTARS_CLIENT_ID=$VITE_GITSTARS_CLIENT_ID

RUN test -n "$VITE_GITSTARS_CLIENT_ID" || (echo "VITE_GITSTARS_CLIENT_ID build arg is required" >&2; exit 1)
RUN pnpm build

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080

WORKDIR /app

COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node docker/server.js ./docker/server.js
# Runtime-agnostic modules imported by docker/server.js.
COPY --chown=node:node shared ./shared
# package.json marks .js files as ES modules for docker/server.js.
COPY --chown=node:node package.json ./package.json

# Compose runs the container with the host UID/GID (see compose.yaml), so the
# runtime files must be world-readable regardless of the local umask. COPY
# preserves the source file modes, and a restrictive umask on the build host
# would otherwise make e.g. shared/oauth.js unreadable (EACCES on startup).
RUN chmod -R a+rX /app/dist /app/shared /app/docker && chmod a+r /app/package.json

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const tls=Boolean(process.env.TLS_CERT_FILE);const client=require(tls?'https':'http');const request=client.get({hostname:'127.0.0.1',port:Number(process.env.PORT||8080),path:'/healthz',rejectUnauthorized:false},response=>process.exit(response.statusCode===200?0:1));request.on('error',()=>process.exit(1))"

CMD ["node", "docker/server.js"]
