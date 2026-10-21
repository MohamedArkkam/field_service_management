# Security — SiteDirect

## Roles (locked)
| Role | May write | May read |
|------|-----------|----------|
| Admin / Owner | Projects, assignments, internal config | All project ops data for company |
| Site Lead | Progress, publish, bills, labour on assigned sites | Assigned sites |
| Client | — | Approved progress only (own project via token) |

## Controls (current)
- Passwords hashed with BCrypt; JWT Bearer auth
- Backend enforces roles (`@PreAuthorize`); UI is not trusted
- Secrets via environment variables (see `.env.example`); never commit `.env`
- `/api/public/**` is progress-only — no bills, wages, attendance, priority/value
- Client JWTs receive `403` on `/api/admin/**` and `/api/site/**` money/progress-write routes

## Backups (ops)
- PostgreSQL is the system of record — schedule regular dumps (e.g. `pg_dump`) of the `sitedirect` database
- Store dumps encrypted off-host; test restore periodically
- Prefer managed Postgres automated backups in production when available
- Application secrets (`SITEDIRECT_JWT_SECRET`, DB password) rotate independently of DB dumps

## Threat notes
- Client must not reach bills/wages via API guessing (covered by integration tests)
- Site Lead publish is the trust gate — Admin may spot-check process
