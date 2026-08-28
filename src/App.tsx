import { DepositPage } from './features/deposit/deposit-page';
import { LimitsDebugPage } from './features/limits-debug/limits-debug-page';
import { TransactionLimitsHost } from './features/transaction-limits/transaction-limits-host';

// Harnesses live behind a query flag so the deposit demo stays the default view:
//   /?debug=limits  -> raw API payload + classification breakdown
//   /?debug=crm     -> the table as the CRM embeds it
function debugView(): string | null {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('debug');
}

export default function App() {
    const view = debugView();
    if (view === 'limits') return <LimitsDebugPage />;
    if (view === 'crm') return <TransactionLimitsHost />;
    return <DepositPage />;
}
