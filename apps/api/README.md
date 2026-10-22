# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway · JWT security

## M5 hardening
- Integration tests (`SiteDirectApiIntegrationTest`) — Docker CLI Postgres
- OpenAPI / Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: `/actuator/health` (liveness/readiness probes enabled)
- App health: `GET /api/health` (milestone marker)

## Product surface (M1–M3)
- Auth roles: `ADMIN` / `SITE_LEAD` / `CLIENT`
- Projects, publish gate, public progress token
- Site purchases + attendance/labour (internal)
- **Hard rule:** `/api/public/**` and Client never see bills/wages/attendance

## Demo accounts (seeded on startup)

Idempotent — safe to restart; skips rows that already exist. Disable with `SITEDIRECT_DEMO_SEED=false` (off in tests).

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sitedirect.local` | `Admin123!` |
| Site Lead | `sitelead@sitedirect.local` | `Lead1234!` |

Also seeds **Demo Site Project** and assigns the Site Lead to it (for Expo Go / Swagger demos).

## Run
```bash
docker compose up -d   # free host :5432 if local Postgres conflicts
cd apps/api
mvn spring-boot:run
```

## Test
```bash
# Docker CLI required (`docker` on PATH)
mvn test
```

## Deploy readiness (minimal)
- Configure `SPRING_DATASOURCE_*` and `SITEDIRECT_JWT_SECRET` via env
- Probe `/actuator/health` (and `/actuator/health/liveness` / `readiness` when supported)
- Backups: see `docs/SECURITY.md`
