// Vercel serverless proxy (top-level catch-all under /api).
//
// vercel.json rewrites /nexxus/* -> /api/* ; this forwards to the nexxus brand
// service and injects x-secret-token from the server env NEXXUS_SECRET_TOKEN, so the
// secret never reaches the browser and there is no CORS (browser is same-origin).

export default async function handler(req, res) {
    const target = (process.env.NEXXUS_API_TARGET || 'https://api.nexxus.fynxt.io').replace(/\/$/, '');
    const token = process.env.NEXXUS_SECRET_TOKEN || '';

    const segments = Array.isArray(req.query.path)
        ? req.query.path
        : req.query.path
          ? [req.query.path]
          : [];

    const upstream = new URL(`${target}/nexxus/${segments.join('/')}`);
    for (const [key, value] of Object.entries(req.query)) {
        if (key === 'path') continue;
        if (Array.isArray(value)) value.forEach((v) => upstream.searchParams.append(key, v));
        else if (value != null) upstream.searchParams.set(key, String(value));
    }

    const headers = { accept: 'application/json' };
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
    if (token) headers['x-secret-token'] = token;

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
