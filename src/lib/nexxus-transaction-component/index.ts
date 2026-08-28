/**
 * Local stand-in for the published `@nexxus/transaction-component`.
 *
 * The demo integrates exactly as the CRM does -- same specifier, same lazy
 * default-export import, same props -- so the integration code here is the code
 * the CRM runs. Only what the specifier resolves to differs: a Vite alias (and
 * the matching tsconfig path) points it at the local implementation, because the
 * real package is not on a registry this project can reach.
 *
 * To switch to the real package: install it, then delete the alias in
 * vite.config.ts and the path in tsconfig.json. No calling code changes.
 */
export {
    TransactionLimitsComponent,
    type TransactionLimitsComponentProps,
} from '@/features/transaction-limits/transaction-limits-component';
