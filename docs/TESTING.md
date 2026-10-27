# Testing — SiteDirect

## Critical behaviours (automated in M5)
1. Client cannot see unpublished progress (`SiteDirectApiIntegrationTest`)
2. Client cannot read bills or wages / Admin & Site money routes (`SiteDirectApiIntegrationTest`)
3. Unpaid / Partial purchases stay visible to Admin until Paid (`SiteDirectApiIntegrationTest`)
4. Role checks on API routes (same suite)
5. Site Lead publish gate: draft hidden → publish → public visible
6. Admin `GET /api/projects/{id}/progress` returns DRAFT + PUBLISHED (public still published-only)
7. Unassigned Site Lead cannot create/publish progress (400 “Not assigned…”)
8. Re-publishing an already PUBLISHED update fails with 400 “already published”

## Deferred
- **Progress rating (1–5):** deferred. Publish sets status/publishedAt only; no rating request field, Admin/Client UI, or public DTO field. Column `progress_updates.rating` remains nullable/unused (`V6__defer_progress_rating`). Do not reinvent unless asked.

## Layers
- **API / integration:** Spring Boot + Docker CLI PostgreSQL (`apps/api`)
- **Web builds:** `admin-web` / `client-web` / `sitelead-web` compile in CI
- Native Expo app: removed from repo for v1; recreate later if needed

## Run API tests locally
Requires Docker CLI (`docker` on PATH) unless you point at an external Postgres via `SPRING_DATASOURCE_*`.

```bash
cd apps/api
mvn test
# or full verify
mvn verify
```

## CI
GitHub Actions: `.github/workflows/ci.yml`  
On push/PR to `master` (and push to `feature/**`): build API + run tests against a Postgres service container; build admin-web and client-web.

```bash
# Approximate local equivalent of CI API job
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sitedirect
export SPRING_DATASOURCE_USERNAME=sitedirect
export SPRING_DATASOURCE_PASSWORD=sitedirect
cd apps/api && mvn -B verify
cd apps/admin-web && npm ci && npm run build
cd apps/client-web && npm ci && npm run build
```
