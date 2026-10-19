# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway

## M0
- Spring Boot shell
- Datasource + Flyway wired to local Postgres (`docker-compose.yml` at repo root)
- `GET /api/health`

Domain features (auth, projects, publish gate, bills/labour) start in **M1+**.

## Run
```bash
# from repo root
docker compose up -d
cd apps/api
mvn spring-boot:run
```

Health: http://localhost:8080/api/health
