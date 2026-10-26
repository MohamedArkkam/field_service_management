# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway · JWT security

## Package map (`com.sitedirect.api`)

| Package | Responsibility |
|---------|----------------|
| `config` / `security` | Spring Security, JWT, OpenAPI |
| `common` | Health, exception handler, shared `Role` |
| `auth` | Login, users, deactivate/reactivate |
| `projects` | Projects, milestones, assignments, archive, site access |
| `progress` | Draft/publish progress (Admin, Site Lead, public client link) |
| `billslabour` | Purchases, workers, attendance, labour, liabilities |
| `bootstrap` | Admin + demo seeders |

Controllers keep existing URL prefixes (`/api/auth`, `/api/projects`, `/api/site`, `/api/public`, `/api/admin`).

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
| Site Lead (Kumar) | `sitelead@sitedirect.local` | `Lead1234!` |
| Site Lead (Fatima) | `fatima@sitedirect.local` | `Lead1234!` |
| Client (Joseph) | `joseph@example.com` | `Client123!` |
| Client (School) | `school@example.com` | `Client123!` |

### Demo projects (UI review)

| Project | Priority | Assigned | Seeded content |
|---------|----------|----------|----------------|
| **Joseph House** | HIGH | Kumar + Joseph | 5 milestones, 2 published + 1 draft progress, Unpaid/Partial/Paid purchases, daily + monthly workers + attendance/labour |
| **School block repair** | MEDIUM | Fatima + School | 3 milestones, 1 published + 1 draft, 1 unpaid purchase |
| **Shop renovation** | LOW | Kumar only | Thin — empty milestones/activity (empty states) |

Public tokens: `demo-site-progress-token` (Joseph), `demo-school-block-token`, `demo-shop-reno-token` → `/p/{token}` or `GET /api/public/p/{token}`.

If an older thin seed already ran, restart the API once so milestones/bills/labour fill in. Recreate the DB only if you need a clean slate.

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
