/**
 * Rule configuration shared by the demo CRM and the CP deposit flow.
 *
 * Kept in a tiny external store (rather than context) so the non-React demo transport
 * can read it synchronously, and persisted to localStorage so a configured scenario
 * survives a reload. `version` bumps on every write, letting the CP re-run fetch-psp
 * as soon as a rule changes in the CRM tab.
 */

import { useSyncExternalStore } from 'react';
import { seedConfig } from './defaults';
import type { BehaviourMode, DemoFeeRule, DemoTransactionLimit, RulesConfig } from './types';

const RULES_KEY = 'nexxus-demo-rules';
const MODE_KEY = 'nexxus-demo-behaviour';

export interface RulesState {
    config: RulesConfig;
    mode: BehaviourMode;
    version: number;
}

function loadConfig(): RulesConfig {
    try {
        const raw = localStorage.getItem(RULES_KEY);
        if (!raw) return seedConfig();
        const parsed = JSON.parse(raw) as Partial<RulesConfig>;
        return {
            feeRules: Array.isArray(parsed.feeRules) ? parsed.feeRules : [],
            transactionLimits: Array.isArray(parsed.transactionLimits) ? parsed.transactionLimits : [],
        };
    } catch {
        return seedConfig();
    }
}

function loadMode(): BehaviourMode {
    try {
        return localStorage.getItem(MODE_KEY) === 'legacy' ? 'legacy' : 'fixed';
    } catch {
        return 'fixed';
    }
}

let state: RulesState = { config: loadConfig(), mode: loadMode(), version: 0 };

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function commit(next: Partial<RulesState>) {
    state = { ...state, ...next, version: state.version + 1 };

    try {
        if (next.config) localStorage.setItem(RULES_KEY, JSON.stringify(state.config));
        if (next.mode) localStorage.setItem(MODE_KEY, state.mode);
    } catch {
        /* private mode / blocked storage — the session still works in memory */
    }

    listeners.forEach((listener) => listener());
}

/** Synchronous read, for the demo transport. */
export function getRulesState(): RulesState {
    return state;
}

export function useRulesState(): RulesState {
    return useSyncExternalStore(subscribe, getRulesState, getRulesState);
}

export function setBehaviourMode(mode: BehaviourMode) {
    commit({ mode });
}

export function resetRules() {
    commit({ config: seedConfig() });
}

function replaceById<T extends { id: string }>(items: T[], next: T): T[] {
    const index = items.findIndex((item) => item.id === next.id);
    if (index === -1) return [...items, next];
    const copy = [...items];
    copy[index] = next;
    return copy;
}

export function saveFeeRule(rule: DemoFeeRule) {
    commit({
        config: { ...state.config, feeRules: replaceById(state.config.feeRules, rule) },
    });
}

export function deleteFeeRule(id: string) {
    commit({
        config: { ...state.config, feeRules: state.config.feeRules.filter((rule) => rule.id !== id) },
    });
}

export function saveTransactionLimit(limit: DemoTransactionLimit) {
    commit({
        config: {
            ...state.config,
            transactionLimits: replaceById(state.config.transactionLimits, limit),
        },
    });
}

export function deleteTransactionLimit(id: string) {
    commit({
        config: {
            ...state.config,
            transactionLimits: state.config.transactionLimits.filter((limit) => limit.id !== id),
        },
    });
}

export function newId(prefix: string): string {
    return prefix + '-' + Math.random().toString(36).slice(2, 9);
}
