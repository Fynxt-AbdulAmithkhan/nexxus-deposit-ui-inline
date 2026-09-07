/**
 * Endpoints for the deposit flow, relative to `${VITE_API_BASE_URL}${VITE_NEXXUS_API_PREFIX}`.
 * Mirrors the nexxus brand-service controllers.
 */
export const API_ENDPOINTS = {
    psp: {
        // GET /psps/currencies -> supported currencies for the brand + environment
        currencies: () => '/psps/currencies',
        // GET /psps/countries -> supported countries (distinct PSP operation countries)
        countries: () => '/psps/countries',
        // GET /psps -> configured PSPs for the brand + environment
        configured: () => '/psps',
        // GET /psps/{actionId}/ENABLED/{currency} -> enabled PSPs for an action + currency
        byActionAndCurrency: (actionId: string, currency: string) =>
            `/psps/${encodeURIComponent(actionId)}/ENABLED/${encodeURIComponent(currency)}`,
    },
    // CRM rule endpoints. All are in the brand service's `secret-token-paths`, so the
    // same x-secret-token used by the deposit flow authorises them.
    fees: {
        list: () => '/fees',
        create: () => '/fees',
        byId: (id: number | string) => `/fees/${id}`,
    },
    transactionLimits: {
        list: () => '/transaction-limits',
        create: () => '/transaction-limits',
        byId: (id: number | string) => `/transaction-limits/${id}`,
    },
    riskRules: {
        list: () => '/risk-rules',
        create: () => '/risk-rules',
        byId: (id: number | string) => `/risk-rules/${id}`,
    },
    routingRules: {
        list: () => '/routing-rules',
        create: () => '/routing-rules',
        byId: (id: number | string) => `/routing-rules/${id}`,
    },
    // Brand + environment lookups. Both are in the service's `no-brand-env-paths`, so
    // they resolve without X-BRAND-ID / X-ENV-ID and can be used to pick one.
    brands: {
        list: () => '/brands',
    },
    environments: {
        listByBrand: (brandId: string) => `/environments/brand/${encodeURIComponent(brandId)}`,
    },
    flowTypes: {
        list: () => '/flow-types',
    },
    flowActions: {
        listByFlowType: (flowTypeId: string) =>
            `/flow-types/${encodeURIComponent(flowTypeId)}/flow-actions`,
    },
    requests: {
        // POST /requests/fetch-psp -> { requestId, psps[] }
        fetchPsp: () => '/requests/fetch-psp',
    },
    transactions: {
        // POST /transactions -> { txnId, txnSuccess, sessionUrl }
        create: () => '/transactions',
    },
    sessions: {
        // GET /sessions/{token} -> navigation payload (rendered by the widget)
        get: (token: string) => `/sessions/${encodeURIComponent(token)}`,
    },
} as const;
