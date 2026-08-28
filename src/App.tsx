import { AppNav, type ViewKey } from './components/app-nav';
import { DepositPage } from './features/deposit/deposit-page';
import { LimitsDebugPage } from './features/limits-debug/limits-debug-page';
import { TransactionLimitsHost } from './features/transaction-limits/transaction-limits-host';

function currentView(): ViewKey {
    if (typeof window === 'undefined') return 'deposit';
    const debug = new URLSearchParams(window.location.search).get('debug');
    if (debug === 'crm') return 'crm';
    if (debug === 'limits') return 'limits';
    return 'deposit';
}

export default function App() {
    const view = currentView();

    return (
        <>
            <AppNav active={view} />
            {view === 'crm' && <TransactionLimitsHost />}
            {view === 'limits' && <LimitsDebugPage />}
            {view === 'deposit' && <DepositPage />}
        </>
    );
}
