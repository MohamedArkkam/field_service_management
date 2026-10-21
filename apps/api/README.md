# SiteDirect Core API (`apps/api`)

Java 21 · Spring Boot · PostgreSQL · Flyway · JWT security

## M3
- Site purchases: **UNPAID / PARTIAL / PAID** (amount + amountPaid)
- Workers: **DAILY** wage or **MONTHLY** salary
- Attendance creates labour liability (daily per day; monthly once per calendar month)
- Admin outstanding liability overview: `GET /api/admin/liabilities`
- Site Lead logs via `/api/site/...` (mobile later)

**Hard rule:** `/api/public/**` and Client role never see bills, wages, or attendance.

## Roles
- `ADMIN` / `SITE_LEAD` / `CLIENT`
- Seeded admin: `admin@sitedirect.local` / `Admin123!`

## Run
```bash
docker compose up -d   # free host :5432 if local Postgres conflicts
cd apps/api
mvn spring-boot:run
```

## Key endpoints
- Public (no auth): `GET /api/public/p/{token}` — published progress only
- Site Lead:  
  - `POST/GET /api/site/projects/{id}/workers`  
  - `POST/GET /api/site/projects/{id}/purchases` · `PUT .../purchases/{id}/payment`  
  - `POST/GET /api/site/projects/{id}/attendance`  
  - `GET /api/site/projects/{id}/labour` · `PUT .../labour/{id}/payment`
- Admin: `GET /api/admin/liabilities` (+ per-project workers/purchases/attendance/labour)
