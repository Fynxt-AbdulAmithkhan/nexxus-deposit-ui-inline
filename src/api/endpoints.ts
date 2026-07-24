/**
 * Endpoints for the deposit flow, relative to `${VITE_API_BASE_URL}${VITE_NEXXUS_API_PREFIX}`.
 * Mirrors the nexxus brand-service controllers.
 */
export const API_ENDPOINTS = {
    psp: {
        // GET /psps/currencies -> supported currencies for the brand + environment
        currencies: () => '/psps/currencies',
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
