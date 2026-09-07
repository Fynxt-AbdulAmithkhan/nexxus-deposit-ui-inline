import { REQUEST_CONTEXT } from '../deposit/config';
import type { DemoFeeRule, DemoPsp, DemoTransactionLimit, RulesConfig } from './types';

/** Flow action the demo deposits run against. */
export const DEPOSIT_ACTION_ID = REQUEST_CONTEXT.actionId;

/** Currencies the demo brand supports (GET /psps/currencies stand-in). */
export const DEMO_CURRENCIES = ['USD', 'NGN', 'GHS', 'EUR', 'ZAR', 'KES'];

/** Customer tags a limit can be scoped to. */
export const DEMO_CUSTOMER_TAGS = ['VIP', 'Important', 'Premium', 'Standard', 'New Customer', 'Banned'];

/** The demo PSP catalogue. Rules attach to these ids. */
export const DEMO_PSPS: DemoPsp[] = [
    { id: 'psp-korapay', name: 'Korapay' },
    { id: 'psp-payport', name: 'PayPort' },
    { id: 'psp-unlimit', name: 'Unlimit' },
    { id: 'psp-checkout', name: 'Checkout.com' },
    { id: 'psp-paytiko', name: 'Paytiko' },
    { id: 'psp-bridgerpay', name: 'BridgerPay' },
];

export function pspName(pspId: string): string {
    return DEMO_PSPS.find((p) => p.id === pspId)?.name ?? pspId;
}

/**
 * Seed configuration, shaped after the real staging rules. Between them these cover every
 * dimension of the NEX-98223 defect, so switching the behaviour toggle visibly changes the
 * outcome:
 *
 * - fee scoped to BY only        -> must not be charged to a US customer
 * - fee scoped to US/EU          -> must be charged to a US customer
 * - fee with no countries        -> unrestricted, charged everywhere
 * - limit scoped to BY only      -> must not hide the PSP from a US customer
 * - limit in a different currency-> must not hide the PSP from a USD deposit
 * - limit in scope, amount below -> must still reject (the amount check is the only denial)
 */
const SEED_FEE_RULES: DemoFeeRule[] = [
    {
        id: 'fee-belarus-inclusive',
        name: 'belarus-inclusive',
        chargeFeeType: 'INCLUSIVE',
        currency: 'USD',
        countries: ['BY'],
        pspIds: ['psp-korapay'],
        components: [{ type: 'FIXED', amount: 10 }],
        enabled: true,
    },
    {
        id: 'fee-us-eu-exclusive',
        name: 'us-eu-exclusive',
        chargeFeeType: 'EXCLUSIVE',
        currency: 'USD',
        countries: ['US', 'EU'],
        pspIds: ['psp-korapay', 'psp-payport'],
        components: [{ type: 'PERCENTAGE', amount: 1.5 }],
        enabled: true,
    },
    {
        id: 'fee-unrestricted-inclusive',
        name: 'unrestricted-inclusive',
        chargeFeeType: 'INCLUSIVE',
        currency: 'USD',
        countries: [],
        pspIds: ['psp-unlimit'],
        components: [
            { type: 'PERCENTAGE', amount: 2 },
            { type: 'FIXED', amount: 1 },
        ],
        enabled: true,
    },
    {
        id: 'fee-ngn-west-africa',
        name: 'ngn-west-africa',
        chargeFeeType: 'INCLUSIVE',
        currency: 'NGN',
        countries: ['NG', 'GH'],
        pspIds: ['psp-paytiko'],
        components: [{ type: 'PERCENTAGE', amount: 2.5 }],
        enabled: true,
    },
];

const SEED_TRANSACTION_LIMITS: DemoTransactionLimit[] = [
    {
        id: 'limit-belarus-only',
        name: 'belarus-only-band',
        currency: 'USD',
        countries: ['BY'],
        customerTags: [],
        pspIds: ['psp-checkout'],
        actions: [{ flowActionId: DEPOSIT_ACTION_ID, minAmount: 10, maxAmount: 1000 }],
        enabled: true,
    },
    {
        id: 'limit-us-standard',
        name: 'us-standard-band',
        currency: 'USD',
        countries: ['US'],
        customerTags: ['VIP', 'Standard'],
        pspIds: ['psp-korapay'],
        actions: [{ flowActionId: DEPOSIT_ACTION_ID, minAmount: 20, maxAmount: 500 }],
        enabled: true,
    },
    {
        id: 'limit-ngn-band',
        name: 'ngn-band',
        currency: 'NGN',
        countries: ['NG'],
        customerTags: [],
        pspIds: ['psp-bridgerpay'],
        actions: [{ flowActionId: DEPOSIT_ACTION_ID, minAmount: 1000, maxAmount: 100000 }],
        enabled: true,
    },
];

export function seedConfig(): RulesConfig {
    return {
        feeRules: structuredClone(SEED_FEE_RULES),
        transactionLimits: structuredClone(SEED_TRANSACTION_LIMITS),
    };
}
