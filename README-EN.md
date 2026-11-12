![Gitstars](docs/brand.png)

<div align="center">

[简体中文](./README.md) / [English](./README-EN.md)

</div>

Gitstars helps you manage your GitHub Stars. Sign in with GitHub to filter saved repositories by topic or programming language, search your collection, preview READMEs, and explore popular projects by language.

[Try Gitstars online](https://cfour-hi-gitstars.vercel.app/)

## Screenshot

![Your Stars view showing repository categories, search, and a README preview](docs/example-your-stars.png)

In **Your Stars**, you can search by repository owner, name, or description and sort by starred date or star count. **Gitstars Ranking** shows popular repositories by programming language. The interface is available in Chinese and English. [Ranking screenshot](docs/example-github-ranking.png)

## Quick start with Docker

You need Docker, Docker Compose, and [mkcert](https://github.com/FiloSottile/mkcert). Run the following commands from the repository root.

### 1. Create a GitHub OAuth App

Create an OAuth App, set both **Homepage URL** and **Authorization callback URL** to `https://localhost:8080`, and get the Client ID and Client Secret. [GitHub Developer Settings](https://github.com/settings/developers)

### 2. Configure the environment

```bash
cp .env.example .env
id -u
id -g
```

Set the following variables in `.env`. The Client Secret is for server-side use. Keep `.env` and the certificate's private key secure.

| Variable                        | Value                                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `VITE_GITSTARS_CLIENT_ID`       | OAuth App Client ID, embedded in the frontend at build time                                           |
| `GITHUB_CLIENT_SECRET`          | OAuth App Client Secret, passed to the container at runtime                                           |
| `GITSTARS_UID` / `GITSTARS_GID` | Output of `id -u` / `id -g`, respectively, so the container can read the private key with mode `0600` |
| `GITSTARS_PORT`                 | Host HTTPS port, default `8080`. Update the OAuth callback port if you change it                      |
| `GITSTARS_CERT_DIR`             | Local certificate directory, default `./.certs`                                                       |

### 3. Generate certificates and start Gitstars

```bash
./scripts/setup-local-https.sh
docker compose up -d --build
```

The script trusts the local mkcert CA and generates `localhost.pem` and `localhost-key.pem` in the certificate directory. Once the container starts, open [Gitstars](https://localhost:8080) or check the [health endpoint](https://localhost:8080/healthz).

Run `docker compose logs -f gitstars` to view logs and `docker compose down` to stop the service.

## Local development

Use Node.js 22.x (at least 22.13) and pnpm 12.18.0 to match the CI environment.

```bash
pnpm install
pnpm cert:local
pnpm dev
```

Vite serves the app at `https://localhost:30000` by default. To test GitHub sign-in, set `VITE_API_PROXY` in `.env` to a running Gitstars OAuth backend, such as `https://localhost:8080`. Use the Client ID that pairs with the backend's Client Secret, and set that OAuth App's callback URL to the address you use to open the dev app.

CI runs `pnpm format:check`, `pnpm lint`, `pnpm test`, and `pnpm build` in that order.

## Deploy to Vercel

Import the repository, set `VITE_GITSTARS_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the Vercel project environment, and set the GitHub OAuth App's callback URL to the deployed site's root URL. Existing deployments can still use `VITE_GITSTARS_CLIENT_SECRET`. Use `GITHUB_CLIENT_SECRET` for new deployments. [Vercel deployment Wiki (Chinese)](https://github.com/cfour-hi/gitstars/wiki/Vercel-%E9%83%A8%E7%BD%B2)

## Troubleshooting

- **GitHub reports `The redirect_uri is not associated with this application`.** Use the site root as the callback URL. Its scheme, host, and port must match the browser address, for example `https://localhost:8080`.
- **The browser does not trust the local certificate.** Run `./scripts/setup-local-https.sh` again and restart your browser. Firefox may need to trust the local mkcert CA separately.
- **Gitstars still uses old OAuth credentials.** Run `docker compose up -d --build` after changing the Client ID. If you only changed the Client Secret, run `docker compose up -d --force-recreate`.

## License

[MIT License](LICENSE)
