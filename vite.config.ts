import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    // Hosted brand-service the dev proxy forwards to (server-side -> no browser CORS).
    const apiTarget = env.VITE_API_TARGET || 'https://api.nexxus.fynxt.io';

    return {
        plugins: [react()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
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
                            ['origin', 'referer', 'cookie', 'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform'].forEach(
                                (h) => proxyReq.removeHeader(h),
                            );
                            proxyReq.setHeader('user-agent', 'nexxus-deposit-ui/dev-proxy');
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
