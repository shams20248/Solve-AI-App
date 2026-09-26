## Deployment failure fix

The server is now aligned for workspace deployment:

```bash
npm install
npm run --workspace @solve-ai/server build
npm run --workspace @solve-ai/server start
```

For Railway/Render, use the repository root as the service directory:

- Build command: `npm install && npm run --workspace @solve-ai/server build`
- Start command: `npm run --workspace @solve-ai/server start`
- Health check: `/api/health`

Required production variables are listed in `.env.example`. In particular, configure a real PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET`, and `ADMIN_PASSWORD_HASH`. Do not use the placeholder values.

The service cannot be deployed or tested from GitHub alone; after setting the variables, inspect the platform build log and test:

```bash
curl https://YOUR_API_DOMAIN/api/health
```
