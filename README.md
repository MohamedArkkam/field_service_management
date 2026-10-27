# SiteDirect

Construction site progress and light site operations for a **single construction company**  
(Advanced DevOps — Mohamed Arkkam, ONL-2026-0040).

## Start here
- **[`docs/plan.md`](docs/plan.md)** — locked product plan
- **[`docs/SiteDirect_Project_Proposal.md`](docs/SiteDirect_Project_Proposal.md)** — full proposal
- **[`docs/exports/SiteDirect_Project_Proposal.docx`](docs/exports/SiteDirect_Project_Proposal.docx)** — Word export

## Monorepo (`apps/`)
| Path | Purpose |
|------|---------|
| `apps/api` | Core API — Java 21, Spring Boot, PostgreSQL, Flyway |
| `apps/admin-web` | Admin / Owner — React + TypeScript |
| `apps/client-web` | Client progress link — React + TypeScript |
| `apps/sitelead-web` | Site Lead — mobile-responsive web (current door) |
| `apps/sitelead-mobile` | Site Lead — Expo native (**future**; not v1 door) |

### Code map (where to look)

| Concern | Admin web | API (`com.sitedirect.api`) |
|---------|-----------|----------------------------|
| Shell / routes | `src/app/` | `config/`, `security/`, `common/` |
| Auth / users | `src/features/auth`, `features/users` | `auth/` |
| Projects | `src/features/projects` | `projects/` |
| Progress / publish | (under projects pages) | `progress/` |
| Bills / labour / liabilities | `src/features/liabilities` | `billslabour/` |
| Shared UI / types | `src/shared/` | — |
| Site Lead web | `apps/sitelead-web` | same `/api/site/...` packages |
| Site Lead native (future) | `apps/sitelead-mobile` | same API; Expo later |
| Client progress | `apps/client-web/src/pages` | `progress/` (public) |

## Product lock
- Roles: **Admin / Owner**, **Site Lead**, **Client** only  
- Client sees **progress only** (no company spend)  
- Offline-first deferred (not M0–M3)  
- Site Lead door: **sitelead-web** now; Expo native later

## M0 — local run
```bash
# Postgres
docker compose up -d

# API
cd apps/api
mvn spring-boot:run
# http://localhost:8080/api/health

# Admin web (another terminal)
cd apps/admin-web
npm install
npm run dev

# Client web (another terminal)
cd apps/client-web
npm install
npm run dev -- --port 5174

# Site Lead web (another terminal) — phone browser / responsive
cd apps/sitelead-web
npm install
npm run dev
# http://localhost:5175
```

Copy `.env.example` if you need local env overrides (do not commit `.env`).

## Milestone status
- **M0** — scaffold  
- **M1** — auth/roles, projects, milestones, assignments, progress link token (merged)  
- **M2** — publish gate (Site Lead approve + rate) + client progress view (`apps/client-web`)  
- **M3** — site purchases + attendance/wages + Admin outstanding liabilities (API-first Site Lead)  
- **M4** — Site Lead door: **sitelead-web** (responsive); Expo native deferred (`sitelead-mobile`)
- **M5** — hardening: integration tests, OpenAPI, CI, deploy-ready health/docs  




