import { useSyncExternalStore } from 'react';

/**
 * The brand + environment the harness is pointed at.
 *
 * The secret token already resolves a brand and environment server-side, so this exists
 * to look at a *different* one: when a selection is present it is sent as X-BRAND-ID /
 * X-ENV-ID, which the brand service honours in preference to the token's own context.
 *
 * Kept in a module store (not context) so the non-React API client can read it
 * synchronously when building headers, and persisted so a chosen brand survives a reload.
 */

const STORAGE_KEY = 'nexxus-demo-brand-env';

export interface BrandEnvSelection {
    brandId: string;
    brandName: string;
    environmentId: string;
    environmentName: string;
}

function load(): BrandEnvSelection | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<BrandEnvSelection>;
        if (!(parsed.brandId && parsed.environmentId)) return null;
        return {
            brandId: parsed.brandId,
            brandName: parsed.brandName ?? parsed.brandId,
            environmentId: parsed.environmentId,
            environmentName: parsed.environmentName ?? parsed.environmentId,
        };
    } catch {
        return null;
    }
}

let selection: BrandEnvSelection | null = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Synchronous read, for the API client's header builder. */
export function getBrandEnvSelection(): BrandEnvSelection | null {
    return selection;
}

export function useBrandEnvSelection(): BrandEnvSelection | null {
    return useSyncExternalStore(subscribe, getBrandEnvSelection, getBrandEnvSelection);
}

export function setBrandEnvSelection(next: BrandEnvSelection | null) {
    selection = next;

    try {
        if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* private mode / blocked storage — the session still works in memory */
    }

    listeners.forEach((listener) => listener());
}
