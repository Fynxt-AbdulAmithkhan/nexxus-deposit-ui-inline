// Vercel serverless proxy (plain filename — bracket/catch-all files weren't being
// built under the Vite preset). vercel.json rewrites /nexxus/:path* -> /api/proxy
// with the path passed as ?path=. Forwards to the brand service, injecting
// x-secret-token from server env NEXXUS_SECRET_TOKEN (secret stays server-side; no CORS).

export default async function handler(req, res) {
    const target = (process.env.NEXXUS_API_TARGET || 'https://api.nexxus.fynxt.io').replace(
        /\/$/,
        '',
    );
    const token = process.env.NEXXUS_SECRET_TOKEN || '';

    let path = req.query.path;
    if (Array.isArray(path)) path = path.join('/');
    path = (path || '').replace(/^\/+/, '');

    const upstream = new URL(`${target}/nexxus/${path}`);
    for (const [key, value] of Object.entries(req.query)) {
        if (key === 'path') continue;
        if (Array.isArray(value)) value.forEach((v) => upstream.searchParams.append(key, v));
        else if (value != null) upstream.searchParams.set(key, String(value));
    }

    const headers = { accept: 'application/json' };
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (token) headers['x-secret-token'] = token;

    // Off by default, and it should stay off on anything public. The API honours
    // caller-supplied brand/environment headers while x-secret-token bypasses the
    // permission check, so forwarding these lets a visitor read any brand the
    // token can reach -- not just the one the token belongs to. Enable only on a
    // deployment you control and are using to inspect a specific brand.
    if (process.env.ALLOW_BRAND_OVERRIDE === 'true') {
        for (const name of ['x-brand-id', 'x-env-id']) {
            const value = req.headers[name];
            if (typeof value === 'string' && value) headers[name] = value;
        }
    }

    const init = { method: req.method, headers };
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    }

    try {
        const upstreamRes = await fetch(upstream, init);
        const body = await upstreamRes.text();
        res.status(upstreamRes.status);
        const ct = upstreamRes.headers.get('content-type');
        if (ct) res.setHeader('content-type', ct);
        res.send(body);
    } catch (err) {
        res.status(502).json({ message: 'Proxy error', error: String(err) });
    }
}
