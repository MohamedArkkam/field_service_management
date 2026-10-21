# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway · JWT security

## M2
- Publish gate: Site Lead creates draft progress, then **approve + rate** to publish
- Public client progress: `GET /api/public/p/{token}` — **published only**
- Site Lead (API-first until M4): `/api/site/projects…`
- Admin can list all progress (draft + published) on a project

Not in M2: bills/labour (M3), Site Lead mobile (M4).

## Roles
- `ADMIN` / `SITE_LEAD` / `CLIENT`
- Seeded admin: `admin@sitedirect.local` / `Admin123!`

## Run
```bash
# repo root — needs free host port 5432 (stop any local Postgres if it conflicts)
docker compose up -d
cd apps/api
mvn spring-boot:run
```

Datasource defaults match `docker-compose.yml` (`sitedirect` / `sitedirect` on `localhost:5432`). Override with `SPRING_DATASOURCE_*` if needed.

## Key endpoints
- Health: `GET /api/health`
- Login: `POST /api/auth/login`
- Admin projects/users: `/api/projects`, `/api/users`
- Site Lead progress:  
  - `GET /api/site/projects`  
  - `POST /api/site/projects/{id}/progress` (draft)  
  - `POST /api/site/projects/{id}/progress/{progressId}/publish` `{ "rating": 1-5 }`
- Client (no auth): `GET /api/public/p/{token}`
