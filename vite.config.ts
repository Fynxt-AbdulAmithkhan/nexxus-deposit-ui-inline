import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Hosted brand-service the dev proxy forwards to (server-side -> no browser CORS).
    const apiTarget = env.VITE_API_TARGET || 'https://api.nexxus.fynxt.io';
    // Server-side token for the dev proxy (Codespaces secret / local env). Injected
    // by the proxy so it never ships to the browser.
    const secretToken = process.env.NEXXUS_SECRET_TOKEN || env.NEXXUS_SECRET_TOKEN || '';

    return {
        base: env.VITE_BASE || '/',
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        // Vendored rather than published. Let Vite prebundle it so its peer imports
        // (emotion, chakra) resolve to the same CJS-converted copies the app uses --
        // excluding it leaves raw ESM that breaks on emotion's CJS deps.
        optimizeDeps: { include: ['@nexxus/transaction-component'] },
        server: {
            port: 5176,
            proxy: {
                // Same-origin /nexxus/* -> hosted API. Keeps VITE_API_BASE_URL empty in dev.
                '/nexxus': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: true,
                    // The EXTERNAL-scope endpoints expect a server-to-server call. Strip the
                    // browser-only headers the dev proxy would otherwise forward, so the
                    // upstream sees a clean request (mirrors calling the API directly).
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq: import('node:http').ClientRequest) => {
                            [
                                'origin',
                                'referer',
                                'cookie',
                                'sec-fetch-site',
                                'sec-fetch-mode',
                                'sec-fetch-dest',
                                'sec-ch-ua',
                                'sec-ch-ua-mobile',
                                'sec-ch-ua-platform',
                            ].forEach((h) => proxyReq.removeHeader(h));
                            proxyReq.setHeader('user-agent', 'nexxus-deposit-ui/dev-proxy');
                            // Inject the token server-side when provided (keeps it off the client).
                            if (secretToken) proxyReq.setHeader('x-secret-token', secretToken);
                        });
                    },
                },
            },
        },
        build: {
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom'],
                        chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
                        query: ['@tanstack/react-query'],
                        http: ['axios'],
                    },
                },
            },
        },
    };
});
