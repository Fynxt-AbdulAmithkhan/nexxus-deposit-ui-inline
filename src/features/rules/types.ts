/**
 * Rule model for the demo CRM, mirroring the brand-service DTOs that back
 * CRM > Payment > Transaction Rule.
 */

export type ChargeFeeType = 'INCLUSIVE' | 'EXCLUSIVE';
export type FeeComponentType = 'PERCENTAGE' | 'FIXED';

export interface DemoPsp {
    id: string;
    name: string;
}

export interface DemoFeeComponent {
    type: FeeComponentType;
    amount: number;
    /**
     * Clamps for a PERCENTAGE component. The backend applies these as percentages of the
     * transaction amount (not as currency floors/ceilings on the fee), so they are labelled
     * and evaluated as percentages here to match production.
     */
    minValue?: number;
    maxValue?: number;
}

/** A fee rule (Fees management). `countries` is the field bug 98223 was about. */
export interface DemoFeeRule {
    id: string;
    name: string;
    chargeFeeType: ChargeFeeType;
    currency: string;
    countries: string[];
    pspIds: string[];
    components: DemoFeeComponent[];
    enabled: boolean;
}

/** Per-flow-action amount band on a transaction limit. */
export interface DemoLimitAction {
    flowActionId: string;
    minAmount?: number;
    maxAmount?: number;
}

/** A transaction limit (Transaction limits). */
export interface DemoTransactionLimit {
    id: string;
    name: string;
    currency: string;
    countries: string[];
    customerTags: string[];
    pspIds: string[];
    actions: DemoLimitAction[];
    enabled: boolean;
}

export interface RulesConfig {
    feeRules: DemoFeeRule[];
    transactionLimits: DemoTransactionLimit[];
}

/**
 * Which semantics the demo engine applies.
 *
 * `fixed` is the behaviour after the NEX-98223 fix: a rule outside its configured scope
 * (country, currency, customer tag) is ignored. `legacy` reproduces the shipped bug, where
 * fees ignored countries entirely and an out-of-scope limit rejected the PSP outright.
 */
export type BehaviourMode = 'fixed' | 'legacy';

/** The request context a rule is evaluated against (RequestInputDto). */
export interface DemoRequestContext {
    amount: number;
    currency: string;
    country: string;
    customerTag: string;
    actionId: string;
}
