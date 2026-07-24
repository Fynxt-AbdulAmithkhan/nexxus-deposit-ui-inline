# Deploy / run

The app needs a **server** so the nexxus API is reached through a server-side proxy
that injects the secret token (token never hits the browser; no CORS since the
browser is same-origin). The token is always a **server-side** var,
**`NEXXUS_SECRET_TOKEN`** (never `VITE_`-prefixed).

## A. Run live in GitHub — Codespaces (no external service)

A Codespace is a GitHub cloud VM, so it runs the real app + the Vite dev proxy and
exposes a public URL — with the **live API working**.

1. Add the secret once: repo **Settings → Secrets and variables → Codespaces →
   New secret** → `NEXXUS_SECRET_TOKEN` = your token.
2. **Open in Codespaces:** `https://codespaces.new/Fynxt-AbdulAmithkhan/nexxus-deposit-ui-inline`
   (or the green **Code → Codespaces → Create** button). The devcontainer installs
   deps and runs `pnpm dev` automatically.
3. When port **5176** forwards, open the **Ports** tab and set its visibility to
   **Public**, then copy the URL (`https://<name>-5176.app.github.dev`) — that's the
   live, shareable URL.

> Note: a Codespace is a running environment, not a 24/7 host — it suspends when
> idle and resumes on access. Great for a review session; for an always-on URL use
> the container below.

## B. Self-host the container (always-on, org infra)

`Dockerfile` + `server.js` (zero-dependency Node server) serve the SPA and proxy
`/nexxus/*` with the token injected server-side.

```bash
docker run -p 8080:8080 -e NEXXUS_SECRET_TOKEN=<token> \
  ghcr.io/fynxt-abdulamithkhan/nexxus-deposit-ui-inline:latest
```

The image is rebuilt + published to GHCR on every push
(`.github/workflows/docker-image.yml`). Run it on Azure/K8s/any container host.

## C. Vercel (alternative external host)

Import the repo, set `NEXXUS_SECRET_TOKEN`, deploy. `api/nexxus/[...path].js` +
`vercel.json` do the same proxy.

## D. GitHub Pages — UI preview only (no live API)

`.github/workflows/pages.yml` deploys a static build with `VITE_DEMO=true`
(sample data) to `https://fynxt-abdulamithkhan.github.io/nexxus-deposit-ui-inline/`.
Static hosting can't reach the API, so this is a UI/design preview only.

---

## Auth per environment

| Env | Who sends `x-secret-token` |
|-----|----------------------------|
| Local dev / Codespaces (`pnpm dev`) | the dev proxy, from `NEXXUS_SECRET_TOKEN` (server-side) |
| Container / Vercel | the server-side proxy, from `NEXXUS_SECRET_TOKEN` |
| GitHub Pages | n/a — demo/sample data, no live calls |
