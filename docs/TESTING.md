# Testing — SiteDirect

## Critical behaviours (automated in M5)
1. Client cannot see unpublished progress (`SiteDirectApiIntegrationTest`)
2. Client cannot read bills or wages / Admin & Site money routes (`SiteDirectApiIntegrationTest`)
3. Unpaid / Partial purchases stay visible to Admin until Paid (`SiteDirectApiIntegrationTest`)
4. Role checks on API routes (same suite)
5. Site Lead publish gate: draft hidden → publish → public visible

## Layers
- **API / integration:** Spring Boot + Docker CLI PostgreSQL (`apps/api`)
- **Web builds:** `admin-web` / `client-web` compile in CI
- Site Lead mobile field checks: deferred to M4

## Run API tests locally
Requires Docker CLI (`docker` on PATH).

```bash
cd apps/api
mvn test
# or full verify
mvn verify
```

## CI
GitHub Actions: `.github/workflows/ci.yml`  
On push/PR to `master` (and push to `feature/**`): build API + run tests; build admin-web and client-web.

```bash
# Same commands CI runs
cd apps/api && mvn -B verify
cd apps/admin-web && npm ci && npm run build
cd apps/client-web && npm ci && npm run build
```
