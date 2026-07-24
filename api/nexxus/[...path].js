// Vercel serverless proxy.
//
// The browser calls same-origin `/nexxus/v1/*`; vercel.json rewrites that to this
// function, which forwards to the nexxus brand service and injects the
// `x-secret-token` header from a SERVER-side env var. The secret is therefore never
// shipped to the browser (unlike a VITE_ client var), and there is no CORS because
// the browser only ever talks to its own origin.
//
// Required Vercel env var (server-side, NOT VITE_ prefixed): NEXXUS_SECRET_TOKEN
// Optional: NEXXUS_API_TARGET (defaults to https://api.nexxus.fynxt.io)

export default async function handler(req, res) {
    const target = process.env.NEXXUS_API_TARGET || 'https://api.nexxus.fynxt.io';
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
        const contentType = upstreamRes.headers.get('content-type');
        if (contentType) res.setHeader('content-type', contentType);
        res.send(body);
    } catch (err) {
        res.status(502).json({ message: 'Proxy error', error: String(err) });
    }
}
