import { useBrandEnvSelection } from './brand-environment.store';

/**
 * Stand-in for the CRM's brand/environment context, consumed unmodified by the copied
 * rule screens (they use the ids for query keys and `isReady` for gating).
 *
 * With no selection the harness runs on whatever brand and environment the secret token
 * resolves to, and the ids are placeholders that simply keep the query keys stable. Pick a
 * brand in the header and the real ids are used, which also sends them as X-BRAND-ID /
 * X-ENV-ID so the screens show that brand's rules.
 */
const TOKEN_SCOPED_ID = 'secret-token';

export interface SelectedBrandEnvironment {
    id: string;
    name: string;
}

export function useBrandEnvironment() {
    const selection = useBrandEnvSelection();

    return {
        selectedBrand: {
            id: selection?.brandId ?? TOKEN_SCOPED_ID,
            name: selection?.brandName ?? "The token's brand",
        } as SelectedBrandEnvironment,
        selectedEnvironment: {
            id: selection?.environmentId ?? TOKEN_SCOPED_ID,
            name: selection?.environmentName ?? "The token's environment",
        } as SelectedBrandEnvironment,
        /** Requests are authorised by the secret token, so the screens can always load. */
        isReady: true,
        /** True when pointed at an explicitly chosen brand rather than the token's own. */
        isExplicitSelection: selection !== null,
    };
}
