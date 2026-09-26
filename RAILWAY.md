# Railway deployment checklist

1. Add a **PostgreSQL service** to the Railway project.
2. Deploy this repository as a separate service from the repository root.
3. Do not set the service Root Directory to `apps/server` when using the root workspace configuration.
4. Railway should detect `railway.toml`. If it does not, set:

```text
Build command: npm ci && npm run build:server
Start command: npm run start:server
Health check path: /api/health
```

5. Add variables in Railway. The most important one is:

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Or copy the connection URL from the PostgreSQL service. Also set `JWT_SECRET`, `ADMIN_PASSWORD_HASH`, `CLIENT_URL`, and `NODE_ENV=production`.

6. Deploy and inspect logs. Expected lines:

```text
Database tables initialized successfully
Solve AI server listening on port <Railway PORT>
```

7. Verify:

```bash
curl https://YOUR-RAILWAY-DOMAIN/api/health
```

The application now fails clearly when `DATABASE_URL` is missing instead of silently trying localhost. It also binds to `0.0.0.0` and uses Railway's dynamic `PORT`.
