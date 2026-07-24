// Diagnostic: confirms Vercel serverless functions run and whether the token env is set.
export default function handler(_req, res) {
    res.status(200).json({
        ok: true,
        hasToken: Boolean(process.env.NEXXUS_SECRET_TOKEN),
        node: process.version,
    });
}
