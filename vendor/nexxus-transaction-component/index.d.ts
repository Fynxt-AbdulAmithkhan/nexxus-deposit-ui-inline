import type { ReactElement } from 'react';

export type TransactionLimitsComponentProps = {
    /** API origin, e.g. https://api.nexxus.fynxt.io */
    domain: string;
    /** Environment secret token, sent as `x-secret-token`. */
    secretToken: string;
    brandId?: string;
    environmentId?: string;
    /** Scopes the flow actions offered by the create/edit form. */
    flowTypeId?: string;
    /** Path prefix appended to `domain`. Defaults to /nexxus/v1. */
    apiPrefix?: string;
    /**
     * Set false when the host already renders a ChakraProvider and a
     * QueryClientProvider, to avoid nesting a second one.
     */
    withProviders?: boolean;
};

// Declared as a plain function rather than FC: the FC return type differs
// between React 18 and 19 typings, and a host on either should be able to
// lazy() this component.
export declare function TransactionLimitsComponent(
    props: TransactionLimitsComponentProps,
): ReactElement | null;
