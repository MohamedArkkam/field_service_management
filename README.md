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
| `apps/sitelead-mobile` | Site Lead — React Native (Expo) placeholder until M4 |

## Product lock
- Roles: **Admin / Owner**, **Site Lead**, **Client** only  
- Client sees **progress only** (no company spend)  
- Offline-first deferred (not M0–M3)  
- API-first for Site Lead until M4  

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
```

Copy `.env.example` if you need local env overrides (do not commit `.env`).

## Milestone status
- **M0** — scaffold (this commit)  
- **M1+** — auth, projects, publish gate, bills/labour, Site Lead Expo app  
