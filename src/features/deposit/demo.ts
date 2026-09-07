// Preview/demo mode (VITE_DEMO=true) — used for the static GitHub Pages build,
// where the live API can't be reached (static hosting can't proxy or hold the
// secret). Returns sample data so the UI is fully clickable end-to-end.

import type { CreateTransactionResponse, FetchPspRequest, FetchPspResponse, PspInfo } from './types';

export const DEMO = import.meta.env.VITE_DEMO === 'true';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEMO_CURRENCIES = ['USD', 'NGN', 'GHS', 'EUR', 'ZAR', 'KES'];
const DEMO_PROVIDERS = ['Korapay', 'PayPort', 'Unlimit', 'Checkout.com', 'Paytiko', 'BridgerPay'];

const DEMO_GATEWAY = `data:text/html;charset=utf-8,${encodeURIComponent(
    `<!doctype html><html><body style="margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f6f9ff;color:#0040b3"><div style="text-align:center;max-width:420px;padding:24px"><div style="font-size:44px">🔒</div><h2>Demo payment gateway</h2><p style="color:#3f3f46">This is a preview. In production the selected provider's live checkout loads here.</p></div></body></html>`,
)}`;

export async function demoCurrencies(): Promise<string[]> {
    await delay(250);
    return DEMO_CURRENCIES;
}

export async function demoFetchPsp(body: FetchPspRequest): Promise<FetchPspResponse> {
    await delay(450);
    const psps: PspInfo[] = DEMO_PROVIDERS.map((name, i) => ({
        id: `demo-${i}`,
        name,
        currency: body.currency ?? 'USD',
        originalAmount: body.amount,
        totalAmount: body.amount,
        feeApplied: false,
        flowActionId: body.actionId,
        flowDefintionId: 'demo',
        flowTarget: { flowTargetId: 'demo' },
    }));
    return { requestId: 'demo-request', psps };
}

export async function demoCreateTransaction(): Promise<CreateTransactionResponse> {
    await delay(500);
    return { txnId: 'demo-txn', txnSuccess: true, sessionUrl: DEMO_GATEWAY };
}
