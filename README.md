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

## CRM + CP in one app

The app has two tabs, both talking to the real brand service — there is no local rule
engine and nothing is simulated, so what you see is whatever the deployed backend does.

- **CRM tab** — a stand-in for CRM > Payment > Transaction Rule, built from the CRM's own
  `DataTable`, `Modal`, `Tabs` and rule forms so it matches the real screens. Reads and
  writes real fee rules and transaction limits (`/fees`, `/transaction-limits`, both in
  the service's `secret-token-paths`, so the environment secret token authorises them).
- **Client Portal tab** — the deposit flow. Each PSP card shows the fee breakdown the API
  returned, including an explicit "no fee applied" state, which is what makes the
  country/currency scoping of a rule observable.

Create a rule in the CRM tab, deposit in the CP tab, and the outcome is the backend's
answer. That is the point: a fix is verified by deploying it, not by a switch here.

### Pointing at a brand

The secret token resolves one brand and environment, so by default every call runs on
*that* brand — which is why the rules shown will not match another brand's rules in the
real CRM. The header brand/environment selector sends `X-BRAND-ID` / `X-ENV-ID`, which
the service prefers over the token's own context.

This works under `pnpm dev` (Vite forwards the headers). A **deployed** build's proxy
strips them unless `ALLOW_BRAND_OVERRIDE=true` is set server-side — deliberately, since
`x-secret-token` bypasses the permission check, so forwarding them unconditionally would
let any visitor read every brand the token can reach. See `server.js` / `api/proxy.js`.

The deposit flow's `actionId` is also read from the API (flow types -> flow actions) per
brand; a hardcoded action id only ever fits the brand it came from.

### VITE_DEMO

`VITE_DEMO=true` builds a UI-only preview with sample PSPs (used by the GitHub Pages
workflow). The CRM tab needs the live API, so in that mode it says so and the brand
selector is hidden. Sample wallets, balances, FX rates and the customer profile in
[`config.ts`](src/features/deposit/config.ts) are always local — the brand service has no
endpoint for them.

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
  features/crm/            CRM rule screens, copied from the CRM frontend
    transaction-limits/    limits list + modal form
    fee/                   fees list + modal form
    risk/                  risk rules list + modal form
    routing/               routing rules list + query-builder form
    crm-page.tsx           PageHeader + the four rule tabs
  features/brand-env/      brand + environment selector
  components/ui/           CRM DataTable, Modal, Tabs, PageHeader, formatters
  components/forms/        CRM form inputs (input, select, multi-select, ...)
  hooks/                   brand/environment, flow types + actions, common form
  api/services/            fee, transaction-limit, psp, flow, brand services
  locales/en.json          translation subset the copied screens need
```

The CRM components under `components/`, `hooks/use-common-form.ts` and `features/crm/`
are copies of the nexxus CRM frontend, adapted only where they were coupled to its auth
store or its FontAwesome kit (`components/ui/Icon` is mapped onto lucide). They will drift
from the real CRM over time; the real CRM is the source of truth.
