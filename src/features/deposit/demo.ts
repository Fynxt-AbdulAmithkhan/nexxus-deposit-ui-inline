// Demo transport (VITE_DEMO=true). Stands in for the brand service so the flow is
// clickable without a backend — and, with the rules engine behind it, so the fee and
// transaction-limit models can be exercised against rules authored in the CRM tab.

import { DEMO_CURRENCIES, DEMO_PSPS } from '../rules/defaults';
import { calculateFees, evaluateLimits } from '../rules/engine';
import { getRulesState } from '../rules/store';
import type { DemoRequestContext } from '../rules/types';
import type {
    CreateTransactionResponse,
    ExcludedPsp,
    FetchPspRequest,
    FetchPspResponse,
    PspInfo,
} from './types';

export const DEMO = import.meta.env.VITE_DEMO === 'true';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_GATEWAY = `data:text/html;charset=utf-8,${encodeURIComponent(
    `<!doctype html><html><body style="margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f6f9ff;color:#0040b3"><div style="text-align:center;max-width:420px;padding:24px"><div style="font-size:44px">🔒</div><h2>Demo payment gateway</h2><p style="color:#3f3f46">This is a preview. In production the selected provider's live checkout loads here.</p></div></body></html>`,
)}`;

export async function demoCurrencies(): Promise<string[]> {
    await delay(250);
    return DEMO_CURRENCIES;
}

/**
 * Mirrors POST /requests/fetch-psp: transaction limits filter the PSP list, then fees are
 * calculated for whatever survived. Excluded PSPs are reported back (a demo-only field) so
 * the harness can show which limit removed them and why.
 */
export async function demoFetchPsp(body: FetchPspRequest): Promise<FetchPspResponse> {
    await delay(350);

    const { config, mode } = getRulesState();

    const ctx: DemoRequestContext = {
        amount: body.amount,
        currency: body.currency ?? 'USD',
        country: body.country,
        customerTag: body.customerTag,
        actionId: body.actionId,
    };

    const psps: PspInfo[] = [];
    const excludedPsps: ExcludedPsp[] = [];

    for (const psp of DEMO_PSPS) {
        const decision = evaluateLimits(psp.id, config.transactionLimits, ctx, mode);

        if (!decision.allowed) {
            excludedPsps.push({
                id: psp.id,
                name: psp.name,
                reason: decision.reason ?? 'Filtered by a transaction limit',
            });
            continue;
        }

        const fees = calculateFees(psp.id, config.feeRules, ctx, mode);

        psps.push({
            id: psp.id,
            name: psp.name,
            currency: ctx.currency,
            flowActionId: body.actionId,
            flowDefintionId: 'demo',
            flowTarget: { flowTargetId: 'demo' },
            originalAmount: fees.originalAmount,
            totalAmount: fees.totalAmount,
            netAmountToUser: fees.netAmountToUser,
            appliedFeeAmount: fees.appliedFeeAmount,
            inclusiveFeeAmount: fees.inclusiveFeeAmount,
            exclusiveFeeAmount: fees.exclusiveFeeAmount,
            feeApplied: fees.feeApplied,
            fee: fees.fee,
            appliedRuleNames: fees.appliedRuleNames,
            skippedForCountryNames: fees.skippedForCountryNames,
        });
    }

    return { requestId: 'demo-request', psps, excludedPsps };
}

export async function demoCreateTransaction(): Promise<CreateTransactionResponse> {
    await delay(500);
    return { txnId: 'demo-txn', txnSuccess: true, sessionUrl: DEMO_GATEWAY };
}
