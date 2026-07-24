/** Format a number as a currency amount. Falls back to a plain number if the code is unknown. */
export function formatMoney(amount: number | undefined | null, currency: string): string {
    const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`;
    }
}

export function formatRate(from: string, to: string, rate: number): string {
    return `1 ${from} = ${rate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}`;
}

/** Collapse rich-HTML PSP descriptions to a trimmed plain-text snippet for the card. */
export function stripHtml(html: string | undefined | null, maxLen = 140): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}
