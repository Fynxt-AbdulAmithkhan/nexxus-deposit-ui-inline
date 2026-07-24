// Zero-dependency production server (Node built-ins only).
//
// Serves the built SPA from ./dist and proxies /nexxus/* to the nexxus brand
// service, injecting the x-secret-token header from a SERVER-side env var — so the
// secret never reaches the browser and there is no CORS (same-origin only).
//
// Env:
//   PORT                 (default 8080)
//   NEXXUS_API_TARGET    (default https://api.nexxus.fynxt.io)
//   NEXXUS_SECRET_TOKEN  environment secret token (server-side only)

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT || 8080;
const TARGET = (process.env.NEXXUS_API_TARGET || 'https://api.nexxus.fynxt.io').replace(/\/$/, '');
const TOKEN = process.env.NEXXUS_SECRET_TOKEN || '';
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
};

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

async function proxy(req, res) {
    const upstream = new URL(TARGET + req.url); // req.url = /nexxus/v1/... (+ query)
    const headers = { accept: 'application/json' };
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (TOKEN) headers['x-secret-token'] = TOKEN;

    const init = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const body = await readBody(req);
        if (body.length) init.body = body;
    }

    try {
        const upstreamRes = await fetch(upstream, init);
        const buf = Buffer.from(await upstreamRes.arrayBuffer());
        const ct = upstreamRes.headers.get('content-type');
        res.writeHead(upstreamRes.status, ct ? { 'content-type': ct } : undefined);
        res.end(buf);
    } catch (err) {
        res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ message: 'Proxy error', error: String(err) }));
    }
}

async function serveStatic(req, res) {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filePath = path.normalize(path.join(DIST, pathname));

    // block path traversal outside dist
    if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    try {
        const info = await stat(filePath);
        if (info.isDirectory()) filePath = path.join(filePath, 'index.html');
        const data = await readFile(filePath);
        res.writeHead(200, { 'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        res.end(data);
    } catch {
        // SPA fallback → index.html
        try {
            const data = await readFile(path.join(DIST, 'index.html'));
            res.writeHead(200, { 'content-type': MIME['.html'] });
            res.end(data);
        } catch {
            res.writeHead(404);
            res.end('Not found');
        }
    }
}

http.createServer((req, res) => {
    if (req.url === '/nexxus' || req.url.startsWith('/nexxus/')) {
        proxy(req, res);
    } else {
        serveStatic(req, res);
    }
}).listen(PORT, () => {
    console.log(`nexxus-deposit-ui listening on :${PORT} (proxying /nexxus -> ${TARGET})`);
});
