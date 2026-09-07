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
pnpm dev        # http://localhost:5176
pnpm build      # typecheck + production build
```

## Demo CRM + CP harness

With `VITE_DEMO=true` the app runs as a self-contained stand-in for both sides of the
product, so fee and transaction-limit behaviour can be exercised without a backend:

```bash
VITE_DEMO=true pnpm dev
```

- **CRM tab** — a stand-in for CRM > Payment > Transaction Rule. Author fee rules
  (charge type, currency, countries, PSPs, percentage/fixed components) and transaction
  limits (currency, countries, customer tags, PSPs, min/max band). Saved to
  `localStorage`, so a scenario survives a reload.
- **Client Portal tab** — the deposit flow, evaluating whatever the CRM tab holds. Each
  PSP card shows the fee breakdown and which rules were applied or skipped; PSPs removed
  by a limit are listed with the reason.
- **Behaviour toggle** — `fixed` applies the corrected scoping (a rule outside its
  configured country, currency or tag scope is skipped, and only the amount can reject a
  transaction). `legacy` reproduces the shipped defect (NEX-98223): fees ignore their
  countries, and an out-of-scope limit removes the PSP outright. Flipping it shows the
  before/after without deploying anything.

The engine in [`src/features/rules/engine.ts`](src/features/rules/engine.ts) mirrors
`FeeCalculationService` and `TransactionLimitFilterStrategy`. It is a demo model, not the
real thing — to verify the deployed backend, leave `VITE_DEMO` unset and point
`VITE_API_TARGET` at the environment you want to test.

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
  features/rules/          demo CRM (VITE_DEMO only)
    types.ts               rule model mirroring the brand-service DTOs
    defaults.ts            PSP catalogue + seed rules covering the 98223 cases
    engine.ts              fee + transaction-limit evaluation (fixed vs legacy)
    store.ts               localStorage-backed config shared with the CP tab
    components/            rule editors + form primitives
    crm-page.tsx           rule lists + behaviour toggle
```
