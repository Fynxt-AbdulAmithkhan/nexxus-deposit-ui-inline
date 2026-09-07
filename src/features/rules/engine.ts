/**
 * Demo evaluation engine, mirroring the brand service.
 *
 * Fees follow FeeServiceImpl.readLatestEnabledFeeRulesByCriteria + FeeCalculationService;
 * limits follow TransactionLimitFilterStrategy. Each has a `legacy` path reproducing the
 * behaviour shipped before NEX-98223, so the harness can show the defect and the fix
 * side by side without deploying the backend.
 */

import type { FeeDetails } from '../deposit/types';
import { matchesCountry } from '../deposit/utils/country-scope';
import type {
    BehaviourMode,
    DemoFeeComponent,
    DemoFeeRule,
    DemoRequestContext,
    DemoTransactionLimit,
} from './types';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Mirrors the backend's percentageOf: 2dp, half-up. */
const percentageOf = (amount: number, percent: number) => round2((amount * percent) / 100);

// ---------------------------------------------------------------- transaction limits

export interface LimitDecision {
    allowed: boolean;
    /** Human-readable cause when the PSP is excluded. */
    reason?: string;
    /** Limits that were in scope for this request. */
    inScopeNames: string[];
    /** Limits attached to the PSP but skipped as out of scope. */
    outOfScopeNames: string[];
}

/**
 * Why a limit does not govern this request, or null when it does.
 *
 * These are *scope* conditions. After the fix they only narrow which limits are
 * considered; before it, each of them also rejected the transaction, which is the bug.
 */
function limitScopeMismatch(limit: DemoTransactionLimit, ctx: DemoRequestContext): string | null {
    if (limit.currency !== ctx.currency) return 'currency ' + limit.currency;
    if (!matchesCountry(limit.countries, ctx.country)) {
        return 'countries ' + (limit.countries.join(', ') || 'none');
    }
    if (!matchesCustomerTag(limit, ctx.customerTag)) {
        return 'tags ' + limit.customerTags.join(', ');
    }
    if (!hasActionFor(limit, ctx.actionId)) return 'another flow action';
    return null;
}

/** Mirrors the backend's lenient handling of a missing customer tag. */
function matchesCustomerTag(limit: DemoTransactionLimit, customerTag: string): boolean {
    if (limit.customerTags.length === 0 || !customerTag) return true;
    return limit.customerTags.some((tag) => tag.toLowerCase() === customerTag.toLowerCase());
}

function hasActionFor(limit: DemoTransactionLimit, actionId: string): boolean {
    return limit.actions.some((action) => action.flowActionId === actionId);
}

/** The amount check — the only condition allowed to reject a transaction. */
function amountWithinLimit(limit: DemoTransactionLimit, ctx: DemoRequestContext): boolean {
    return limit.actions
        .filter((action) => action.flowActionId === ctx.actionId)
        .some(
            (action) =>
                (action.minAmount == null || ctx.amount >= action.minAmount) &&
                (action.maxAmount == null || ctx.amount <= action.maxAmount),
        );
}

function describeBand(limit: DemoTransactionLimit, actionId: string): string {
    const action = limit.actions.find((a) => a.flowActionId === actionId);
    if (!action) return 'no band';
    const min = action.minAmount == null ? '-' : String(action.minAmount);
    const max = action.maxAmount == null ? '-' : String(action.maxAmount);
    return '"' + limit.name + '" (min ' + min + ' / max ' + max + ')';
}

export function evaluateLimits(
    pspId: string,
    limits: DemoTransactionLimit[],
    ctx: DemoRequestContext,
    mode: BehaviourMode,
): LimitDecision {
    const forPsp = limits.filter((limit) => limit.enabled && limit.pspIds.includes(pspId));

    if (forPsp.length === 0) {
        return { allowed: true, inScopeNames: [], outOfScopeNames: [] };
    }

    const inScope = forPsp.filter((limit) => limitScopeMismatch(limit, ctx) === null);
    const outOfScope = forPsp.filter((limit) => limitScopeMismatch(limit, ctx) !== null);
    const inScopeNames = inScope.map((l) => l.name);
    const outOfScopeNames = outOfScope.map((l) => l.name);

    const amountReason = () =>
        'Amount outside ' + inScope.map((l) => describeBand(l, ctx.actionId)).join(', ');

    if (mode === 'legacy') {
        // Pre-fix: a scope mismatch rejected the transaction instead of narrowing the set,
        // so a limit configured for another country/currency/tag hid the PSP outright.
        const passing = inScope.filter((limit) => amountWithinLimit(limit, ctx));
        if (passing.length > 0) {
            return { allowed: true, inScopeNames, outOfScopeNames };
        }

        const blocker = outOfScope[0];
        const reason = blocker
            ? 'Legacy: "' +
              blocker.name +
              '" is scoped to ' +
              limitScopeMismatch(blocker, ctx) +
              ', and the old code rejected the PSP instead of skipping the limit'
            : amountReason();
        return { allowed: false, reason, inScopeNames, outOfScopeNames };
    }

    // Post-fix: an out-of-scope limit simply does not govern this transaction.
    if (inScope.length === 0) {
        return { allowed: true, inScopeNames, outOfScopeNames };
    }

    if (inScope.some((limit) => amountWithinLimit(limit, ctx))) {
        return { allowed: true, inScopeNames, outOfScopeNames };
    }

    return { allowed: false, reason: amountReason(), inScopeNames, outOfScopeNames };
}

// ------------------------------------------------------------------------------ fees

export interface FeeResult {
    originalAmount: number;
    totalAmount: number;
    netAmountToUser?: number;
    appliedFeeAmount?: number;
    inclusiveFeeAmount?: number;
    exclusiveFeeAmount?: number;
    feeApplied: boolean;
    fee?: FeeDetails;
    /** Rules that were charged. */
    appliedRuleNames: string[];
    /** Rules attached to this PSP, skipped because the country is out of scope. */
    skippedForCountryNames: string[];
}

/** Mirrors FeeCalculationService.applyMinMaxLimits — min/max are percentages of the amount. */
function componentAmount(component: DemoFeeComponent, amount: number): number {
    if (component.type === 'FIXED') return component.amount;

    let calculated = percentageOf(amount, component.amount);
    if (component.minValue != null) {
        const floor = percentageOf(amount, component.minValue);
        if (calculated < floor) calculated = floor;
    }
    if (component.maxValue != null) {
        const ceiling = percentageOf(amount, component.maxValue);
        if (calculated > ceiling) calculated = ceiling;
    }
    return calculated;
}

/** Mirrors FeeRateAccumulator.effectivePercentage — the rate clamped by min/max. */
function effectivePercentage(component: DemoFeeComponent): number {
    let rate = component.amount;
    if (component.minValue != null && rate < component.minValue) rate = component.minValue;
    if (component.maxValue != null && rate > component.maxValue) rate = component.maxValue;
    return rate;
}

export function calculateFees(
    pspId: string,
    rules: DemoFeeRule[],
    ctx: DemoRequestContext,
    mode: BehaviourMode,
): FeeResult {
    const forPsp = rules.filter(
        (rule) => rule.enabled && rule.pspIds.includes(pspId) && rule.currency === ctx.currency,
    );

    // The defect: the fee load path never consulted the rule's countries, so every rule
    // for the brand/action/currency/PSP was charged regardless of the customer's country.
    const applicable =
        mode === 'legacy'
            ? forPsp
            : forPsp.filter((rule) => matchesCountry(rule.countries, ctx.country));

    const skippedForCountryNames =
        mode === 'legacy'
            ? []
            : forPsp
                  .filter((rule) => !matchesCountry(rule.countries, ctx.country))
                  .map((rule) => rule.name);

    let inclusiveFeeAmount = 0;
    let exclusiveFeeAmount = 0;
    const rates = {
        INCLUSIVE: { feePercentage: 0, fixedFee: 0, present: false },
        EXCLUSIVE: { feePercentage: 0, fixedFee: 0, present: false },
    };

    for (const rule of applicable) {
        const bucket = rates[rule.chargeFeeType];
        let ruleAmount = 0;

        for (const component of rule.components) {
            ruleAmount += componentAmount(component, ctx.amount);
            if (component.type === 'PERCENTAGE') {
                bucket.feePercentage += effectivePercentage(component);
            } else {
                bucket.fixedFee += component.amount;
            }
            bucket.present = true;
        }

        if (rule.chargeFeeType === 'INCLUSIVE') inclusiveFeeAmount += ruleAmount;
        else exclusiveFeeAmount += ruleAmount;
    }

    inclusiveFeeAmount = round2(inclusiveFeeAmount);
    exclusiveFeeAmount = round2(exclusiveFeeAmount);
    const totalFeeAmount = round2(inclusiveFeeAmount + exclusiveFeeAmount);
    const feeApplied = totalFeeAmount > 0;

    const fee: FeeDetails | undefined = feeApplied
        ? {
              inclusiveFee: rates.INCLUSIVE.present
                  ? {
                        feePercentage: rates.INCLUSIVE.feePercentage,
                        fixedFee: rates.INCLUSIVE.fixedFee,
                    }
                  : undefined,
              exclusiveFee: rates.EXCLUSIVE.present
                  ? {
                        feePercentage: rates.EXCLUSIVE.feePercentage,
                        fixedFee: rates.EXCLUSIVE.fixedFee,
                    }
                  : undefined,
          }
        : undefined;

    return {
        originalAmount: ctx.amount,
        totalAmount: round2(ctx.amount + exclusiveFeeAmount),
        netAmountToUser: feeApplied ? round2(ctx.amount - inclusiveFeeAmount) : undefined,
        appliedFeeAmount: feeApplied ? totalFeeAmount : undefined,
        inclusiveFeeAmount: feeApplied ? inclusiveFeeAmount : undefined,
        exclusiveFeeAmount: feeApplied ? exclusiveFeeAmount : undefined,
        feeApplied,
        fee,
        appliedRuleNames: applicable.map((rule) => rule.name),
        skippedForCountryNames,
    };
}
