/**
 * Dev only: load the widget from `origin` instead of the host the backend baked into sessionUrl.
 * Set VITE_WIDGET_ORIGIN=http://localhost:5173 to point a local widget at the hosted API.
 */
export function applyWidgetOrigin(sessionUrl: string, origin: string | undefined): string {
    const target = origin?.trim();
    if (!target) return sessionUrl;

    let session: URL;
    let base: URL;
    try {
        session = new URL(sessionUrl);
        base = new URL(target);
    } catch {
        return sessionUrl; // A bad override must never break the real flow.
    }

    // Keep the override's own path prefix, then the session path, query and hash.
    const prefix = base.pathname.replace(/\/+$/, '');
    const rewritten = new URL(`${prefix}${session.pathname}`, base.origin);
    rewritten.search = session.search;
    rewritten.hash = session.hash;
    return rewritten.toString();
}
