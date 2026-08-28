# Vendored `@nexxus/transaction-component`

A build of the package from `nexxus/frontend`, checked in so this demo installs
and deploys without the nexxus repo being present. It is a stand-in for a
registry, not a place to edit code.

Source lives in `nexxus/frontend/src/lib/transaction-component`. To refresh:

```bash
cd ../nexxus/frontend
npx vite build --config vite.lib.config.ts
cp lib-package/dist/index.js  ../../nexxus-deposit-ui-inline/vendor/nexxus-transaction-component/dist/
cp lib-package/index.d.ts     ../../nexxus-deposit-ui-inline/vendor/nexxus-transaction-component/
```

Delete this directory once the package is published to a registry, and depend on
a version range instead.
