import type { Wallet } from './types';

/**
 * Static demo data + the required request context.
 *
 * fetch-psp / transactions require customer/action/country fields on every call.
 * In a real embed these come from the host/session; here they're centralised so
 * you can point the flow at your brand's actual values in one place.
 */
export const REQUEST_CONTEXT = {
    /** Flow action id for the deposit (from the brand's flow config). */
    actionId: 'fat_3v1UUaAwNVQunEoJTZ8oz9pYLW',
    country: 'US',
    customerId: 'cust_001',
    customerTag: 'VIP',
    customerAccountType: 'INDIVIDUAL',
    /** Sent as TransactionDto.transactionType. */
    transactionType: 'deposit',
} as const;

/**
 * Customer details embedded in the transaction executePayload.body. Matches the
 * shape the PSP flow expects (order + customer). Replace with real session data.
 */
export const CUSTOMER_PROFILE = {
    id: REQUEST_CONTEXT.customerId,
    firstName: 'Premium',
    lastName: 'Customer',
    email: 'customer.a@example.com',
    phone: { phoneNumber: '1758818848508', countryCode: '91' },
    address: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94103',
        country: 'US',
    },
    language: 'en',
} as const;

/** The single payment method surfaced once a wallet is chosen. */
export const NEXXUS_METHOD = {
    id: 'nexxus',
    name: 'Nexxus',
    description: 'Pay with cards, bank transfer and local methods via Nexxus.',
} as const;

/**
 * Sample wallets. `supportedCurrencies` is the fallback deposit-currency list used
 * when GET /psps/currencies is unavailable — set to the PSP-supported currencies.
 */
const SUPPORTED = ['NGN', 'GHS'];

export const WALLETS: Wallet[] = [
    { id: 'wallet-usd', accountId: '42911', label: 'USD Wallet', currency: 'USD', balance: 995489.19, flag: '🇺🇸', supportedCurrencies: SUPPORTED },
    { id: 'wallet-eur', accountId: '42912', label: 'EUR Wallet', currency: 'EUR', balance: 95940.0, flag: '🇪🇺', supportedCurrencies: SUPPORTED },
    { id: 'wallet-gbp', accountId: '42917', label: 'GBP Wallet', currency: 'GBP', balance: 0.0, flag: '🇬🇧', supportedCurrencies: SUPPORTED },
    { id: 'wallet-btc', accountId: '178170', label: 'BTC Wallet', currency: 'BTC', balance: 0.0, flag: '🪙', supportedCurrencies: SUPPORTED },
    { id: 'wallet-cad', accountId: '42913', label: 'CAD Wallet', currency: 'CAD', balance: 0.0, flag: '🇨🇦', supportedCurrencies: SUPPORTED },
];

/**
 * Indicative FX rates expressed per 1 USD. Conversion crosses through USD.
 * Replace with a live rates feed when wiring the real conversion source.
 */
export const USD_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.36,
    BTC: 0.0000155,
    NGN: 1580,
    GHS: 15.3,
    KES: 129,
    ZAR: 18.4,
    INR: 83.2,
};
