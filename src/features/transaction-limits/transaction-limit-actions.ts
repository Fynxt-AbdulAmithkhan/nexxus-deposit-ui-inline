/**
 * Mirror of nexxus `frontend/src/helpers/transaction-limit-actions.ts`.
 *
 * Kept as a copy so this harness can show what the real Rules table decides for
 * a given API response without pulling the nexxus frontend in as a dependency.
 * If the nexxus helper changes, update this too.
 */

export type LimitAction = {
    flowActionId: string;
    flowActionName?: string;
    minAmount: number;
    maxAmount: number;
};

export type ActionKind = 'deposit' | 'withdrawal' | 'unclassified';

const DEPOSIT_TERMS = ['deposit', 'payin', 'topup', 'addfunds', 'fundaccount'];
const WITHDRAWAL_TERMS = ['withdrawal', 'withdraw', 'payout', 'cashout'];

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function classifyLimitAction(action: LimitAction): ActionKind {
    const name = action.flowActionName?.trim();
    if (!name) return 'unclassified';

    const normalized = normalize(name);
    if (WITHDRAWAL_TERMS.some((term) => normalized.includes(term))) return 'withdrawal';
    if (DEPOSIT_TERMS.some((term) => normalized.includes(term))) return 'deposit';
    return 'unclassified';
}

export function findActionByKind(
    actions: LimitAction[] | undefined,
    kind: Exclude<ActionKind, 'unclassified'>,
): LimitAction | undefined {
    return actions?.find((action) => classifyLimitAction(action) === kind);
}

export function getUnclassifiedActions(actions: LimitAction[] | undefined): LimitAction[] {
    return (actions ?? []).filter((action) => classifyLimitAction(action) === 'unclassified');
}

export function getActionLabel(action: LimitAction): string {
    return action.flowActionName?.trim() || action.flowActionId;
}

/** The old logic, kept so the harness can show before/after side by side. */
export function legacyCellValue(
    actions: LimitAction[] | undefined,
    kind: 'deposit' | 'withdrawal',
): string {
    const lookup = (a: LimitAction) => (a.flowActionName ?? a.flowActionId).toLowerCase();
    const match = actions?.find((a) =>
        kind === 'deposit'
            ? lookup(a).includes('deposit')
            : lookup(a).includes('withdrawal') || lookup(a).includes('withdraw'),
    );
    return match ? `${match.minAmount.toFixed(2)} - ${match.maxAmount.toFixed(2)}` : 'No limits';
}

/** What the fixed LimitAmountFormatter renders. */
export function fixedCellValue(
    actions: LimitAction[] | undefined,
    kind: 'deposit' | 'withdrawal',
): string {
    const match = findActionByKind(actions, kind);
    if (match) return `${match.minAmount.toFixed(2)} - ${match.maxAmount.toFixed(2)}`;
    if (!actions?.length) return 'No limits';

    const unclassified = getUnclassifiedActions(actions);
    if (unclassified.length === 0) return '—';
    return `${unclassified.length} unlabelled`;
}
