# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway · JWT security

## M1
- Auth + roles: `ADMIN`, `SITE_LEAD`, `CLIENT`
- Admin creates users (Site Lead / Client)
- Projects with Admin-only priority / value / note
- Milestones
- Assign Site Lead + Client
- Progress link token/path (`/p/{token}`) issued per project

Not in M1: publish chain, bills/labour, Site Lead mobile.

## Default seeded admin
- Email: `admin@sitedirect.local`
- Password: `Admin123!`

## Run
```bash
# repo root — needs free host port 5432 (stop any local Postgres if it conflicts)
docker compose up -d
cd apps/api
mvn spring-boot:run
```

Datasource defaults match `docker-compose.yml` (`sitedirect` / `sitedirect` on `localhost:5432`). Override with `SPRING_DATASOURCE_*` if needed.

- Health: `GET /api/health`
- Login: `POST /api/auth/login` `{ "email", "password" }`
- Users (ADMIN): `POST/GET /api/users`
- Projects (ADMIN): `/api/projects`, milestones, assignments, `GET …/progress-link`
