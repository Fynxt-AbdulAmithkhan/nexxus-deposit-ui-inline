import { USD_RATES } from '../config';

/** Convert `amount` from one currency to another via USD cross-rates. */
export function convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    const rateFrom = USD_RATES[from];
    const rateTo = USD_RATES[to];
    if (!rateFrom || !rateTo || !Number.isFinite(amount)) return amount;
    const inUsd = amount / rateFrom;
    return inUsd * rateTo;
}

/** Rate for 1 unit of `from` expressed in `to`. */
export function getRate(from: string, to: string): number {
    return convert(1, from, to);
}
