// Production server for self-hosting (Docker / any Node host / your org's pipeline).
//
// Serves the built SPA and proxies /nexxus/* to the nexxus brand service, injecting
// the x-secret-token header from a SERVER-side env var. The secret never reaches the
// browser, and there's no CORS because the browser only talks to this origin.
//
// Env:
//   PORT                 (default 8080)
//   NEXXUS_API_TARGET    (default https://api.nexxus.fynxt.io)
//   NEXXUS_SECRET_TOKEN  the environment secret token (server-side only)

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 8080;
const TARGET = process.env.NEXXUS_API_TARGET || 'https://api.nexxus.fynxt.io';
const TOKEN = process.env.NEXXUS_SECRET_TOKEN || '';
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');

// --- API proxy (server-side token injection) ---
app.use('/nexxus', express.raw({ type: '*/*', limit: '5mb' }), async (req, res) => {
    // req.url is the path (+ query) after the '/nexxus' mount point.
    const upstream = new URL(`${TARGET}/nexxus${req.url}`);
    const headers = { accept: 'application/json' };
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (TOKEN) headers['x-secret-token'] = TOKEN;

    const init = { method: req.method, headers };
    if (!['GET', 'HEAD'].includes(req.method) && req.body?.length) {
        init.body = req.body;
    }

    try {
        const upstreamRes = await fetch(upstream, init);
        res.status(upstreamRes.status);
        const ct = upstreamRes.headers.get('content-type');
        if (ct) res.setHeader('content-type', ct);
        res.send(Buffer.from(await upstreamRes.arrayBuffer()));
    } catch (err) {
        res.status(502).json({ message: 'Proxy error', error: String(err) });
    }
});

// --- static SPA + fallback ---
app.use(express.static(DIST));
app.use((_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.listen(PORT, () => {
    console.log(`nexxus-deposit-ui listening on :${PORT} (proxying /nexxus -> ${TARGET})`);
});
