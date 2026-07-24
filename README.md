# Nexxus Deposit UI

A standalone React deposit flow that consumes the **nexxus brand-service** APIs.

## Flow

1. **Select a wallet** → a **Nexxus** payment-method card appears.
2. **Select the card → Continue** → a right-side panel opens.
3. In the panel: pick a **deposit currency** (brand-wise, from `GET /psps/currencies`, with a
   per-wallet fallback) and enter an **amount**; a live **FX conversion** is shown.
4. **Continue** → `POST /requests/fetch-psp` returns the list of available **PSPs**.
5. **Select a PSP** → `POST /transactions` returns a `sessionUrl`.
6. The `sessionUrl` (the hosted Nexxus payment widget) loads in a full-screen **iframe**.

## API mapping (brand service, prefix `/nexxus/v1`)

| Step | Endpoint | Notes |
|------|----------|-------|
| Currencies | `GET /psps/currencies` | Brand + environment supported currencies |
| Fetch PSPs | `POST /requests/fetch-psp` | Body `RequestInputDto` → `RequestOutputDto` |
| Create transaction | `POST /transactions` | Body `TransactionDto` → `{ txnId, sessionUrl }` |
| Payment | iframe loads `sessionUrl` | `= widgetUrl + "/" + sessionToken` |

## Configuration

Copy `.env.example` → `.env` and fill in:

```
VITE_API_BASE_URL=http://localhost:8001      # or https://api.connect.fynxt.io
VITE_NEXXUS_API_PREFIX=/nexxus/v1
VITE_ACCESS_TOKEN=<bearer token with EXTERNAL scope>
VITE_BRAND_ID=<brand uuid>
VITE_ENV_ID=<environment uuid>
```

The flow APIs require `EXTERNAL` scope; the token + brand/env ids are attached as
`Authorization: Bearer …`, `X-BRAND-ID`, `X-ENV-ID` on every request.

Demo data (sample wallets, required customer/action/country fields, indicative FX rates)
lives in [`src/features/deposit/config.ts`](src/features/deposit/config.ts) — point these at
your brand's real values.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5174
pnpm build      # typecheck + production build
```

## Structure

```
src/
  api/                     axios client (+ auth headers), endpoints, errors
  providers/               Chakra v3 + TanStack Query
  theme/                   Chakra system (brand palette)
  features/deposit/
    config.ts              wallets, FX rates, request context
    types.ts               DTOs mirrored from the backend
    services/              the three API calls
    hooks/                 useCurrencies / useFetchPsp / useCreateTransaction
    utils/                 conversion + formatting
    components/            wallet selector, Nexxus card, side panel,
                           deposit form, PSP list/card, payment iframe
    deposit-page.tsx       flow orchestrator (state machine)
```
