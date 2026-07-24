# Deploy (Vercel)

The app talks to the nexxus brand service through a **server-side proxy** so the
secret token is never shipped to the browser and there is no CORS.

- `api/nexxus/[...path].js` — serverless proxy; forwards `/nexxus/*` to the API and
  injects `x-secret-token` from the server env var `NEXXUS_SECRET_TOKEN`.
- `vercel.json` — rewrites `/nexxus/*` → the proxy function.
- `.env.production` — client build config (no secrets); requests go same-origin.

## One-time setup

1. Go to **vercel.com → Add New → Project → Import Git Repository**, authorize GitHub,
   and select **`Fynxt-AbdulAmithkhan/nexxus-deposit-ui-inline`**.
2. Framework preset **Vite** is auto-detected (build `pnpm build`, output `dist`).
3. Add an **Environment Variable** (Production + Preview):
   - **`NEXXUS_SECRET_TOKEN`** = your environment secret token (server-side).
     > ⚠️ Do **not** name it `VITE_SECRET_TOKEN` — anything `VITE_`-prefixed is bundled
     > into the browser. The token must stay server-only.
   - *(optional)* `NEXXUS_API_TARGET` = `https://api.nexxus.fynxt.io`
4. **Deploy.** You'll get a URL like `https://nexxus-deposit-ui-inline.vercel.app` — share that.

## How auth works per environment

| Env | Who sends `x-secret-token` |
|-----|----------------------------|
| Local dev (`pnpm dev`) | the client, from `.env` → `VITE_SECRET_TOKEN` (via the Vite dev proxy) |
| Vercel (production) | the serverless proxy, from `NEXXUS_SECRET_TOKEN` (client sends nothing) |
