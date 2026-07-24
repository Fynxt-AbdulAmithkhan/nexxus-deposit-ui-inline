# Deploy

The app must run on a **server** so the nexxus API can be reached through a
server-side proxy that injects the secret token (the token never reaches the
browser, and there's no CORS since the browser only talks to its own origin).

Two supported ways to run that server:

- **Self-host a container** (recommended for org infra) — `Dockerfile` + `server.js`.
- **Vercel** (serverless) — `vercel.json` + `api/nexxus/[...path].js`.

In every case the secret is provided as a **server-side** env var
**`NEXXUS_SECRET_TOKEN`** (never a `VITE_`-prefixed var, which would be bundled
into the browser).

---

## A. Self-host with Docker (org infra — no third-party service)

`server.js` (Express) serves the built SPA and proxies `/nexxus/*` to the brand
service with the token injected server-side.

### Build & run locally

```bash
docker build -t nexxus-deposit-ui .
docker run -p 8080:8080 \
  -e NEXXUS_SECRET_TOKEN=<your token> \
  -e NEXXUS_API_TARGET=https://api.nexxus.fynxt.io \
  nexxus-deposit-ui
# open http://localhost:8080
```

### CI image (GitHub Container Registry)

`.github/workflows/docker-image.yml` builds the image and pushes it to
**`ghcr.io/<owner>/nexxus-deposit-ui-inline`** on every push to `main`
(uses the built-in `GITHUB_TOKEN` — no extra secrets to configure). Your platform
team can then pull and run it on Azure / Kubernetes / any container host:

```bash
docker run -p 8080:8080 -e NEXXUS_SECRET_TOKEN=<token> \
  ghcr.io/fynxt-abdulamithkhan/nexxus-deposit-ui-inline:latest
```

Set `NEXXUS_SECRET_TOKEN` (and optionally `NEXXUS_API_TARGET`) as a secret/env in
your deployment platform. Expose port `8080` behind your ingress.

---

## B. Vercel (alternative)

Import the repo at vercel.com, add env var `NEXXUS_SECRET_TOKEN`, deploy. The
`api/nexxus/[...path].js` serverless function performs the same proxy. See
`vercel.json`.

---

## Auth per environment

| Env | Who sends `x-secret-token` |
|-----|----------------------------|
| Local dev (`pnpm dev`) | the client, from `.env` → `VITE_SECRET_TOKEN` (via the Vite dev proxy) |
| Container / Vercel (production) | the server-side proxy, from `NEXXUS_SECRET_TOKEN` (client sends nothing) |
