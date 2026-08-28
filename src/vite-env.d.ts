/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_NEXXUS_API_PREFIX: string;
    readonly VITE_API_TARGET?: string;
    /** Environment secret token; sent as the `x-secret-token` header (dev only). */
    readonly VITE_SECRET_TOKEN?: string;
    /** Dev only: load the widget from this origin instead of the host in `sessionUrl`. */
    readonly VITE_WIDGET_ORIGIN?: string;
    /** "true" exposes the debug harnesses in a built bundle. Dev builds always do. */
    readonly VITE_ENABLE_DEBUG?: string;
    /** "true" when auth is handled by a server-side proxy (production). */
    readonly VITE_AUTH_VIA_PROXY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
