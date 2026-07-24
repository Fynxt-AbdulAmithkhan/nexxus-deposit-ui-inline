/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_NEXXUS_API_PREFIX: string;
    readonly VITE_API_TARGET?: string;
    /** Environment secret token; sent as the `x-secret-token` header. */
    readonly VITE_SECRET_TOKEN?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
