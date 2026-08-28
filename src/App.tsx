import { lazy, Suspense } from 'react';
import { AppNav, type ViewKey } from './components/app-nav';
import { DepositPage } from './features/deposit/deposit-page';

// The harnesses read a brand's transaction limits, and on a deployed build the
// server-side proxy supplies the secret token for them -- so anyone with the URL
// would be able to browse that data. Keep them to `pnpm dev` unless a build opts
// in explicitly with VITE_ENABLE_DEBUG=true.
//
// They are lazy-loaded so a production bundle does not carry them at all: with
// the flag statically false, Vite drops the chunks rather than shipping code
// that is merely unreachable.
const debugEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG === 'true';

const LimitsDebugPage = debugEnabled
    ? lazy(() =>
          import('./features/limits-debug/limits-debug-page').then((m) => ({
              default: m.LimitsDebugPage,
          })),
      )
    : () => null;
const TransactionLimitsHost = debugEnabled
    ? lazy(() =>
          import('./features/transaction-limits/transaction-limits-host').then((m) => ({
              default: m.TransactionLimitsHost,
          })),
      )
    : () => null;

function currentView(): ViewKey {
    if (typeof window === 'undefined') return 'deposit';
    if (!debugEnabled) return 'deposit';
    const debug = new URLSearchParams(window.location.search).get('debug');
    if (debug === 'crm') return 'crm';
    if (debug === 'limits') return 'limits';
    return 'deposit';
}

export default function App() {
    const view = currentView();

    if (!debugEnabled) return <DepositPage />;

    return (
        <>
            <AppNav active={view} />
            <Suspense fallback={null}>
                {view === 'crm' && <TransactionLimitsHost />}
                {view === 'limits' && <LimitsDebugPage />}
            </Suspense>
            {view === 'deposit' && <DepositPage />}
        </>
    );
}
