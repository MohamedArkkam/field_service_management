# Apps (SiteDirect monorepo)

| App | Path | Stack | Door |
|-----|------|-------|------|
| Core API | `api/` | Java 21, Spring Boot, PostgreSQL, Flyway | Shared backend |
| Admin web | `admin-web/` | React + TypeScript (Vite) | Admin / Owner |
| Client web | `client-web/` | React + TypeScript (Vite) | Client progress link |
| Site Lead web | `sitelead-web/` | React + TypeScript (Vite), mobile-first | Site Lead |

Roles locked: Admin / Owner, Site Lead, Client only.

Native Expo (`sitelead-mobile`) was removed from the monorepo to keep v1 clean; recreate later if needed.

## Code map

**Admin (`admin-web/src`)** — feature folders: `app/` (routes), `features/{auth,projects,users,liabilities}/`, `shared/{components,styles,types,api}`.

**API (`api/.../com/sitedirect/api`)** — package-by-feature: `auth`, `projects`, `progress`, `billslabour`, plus `config`, `security`, `bootstrap`, `common`. HTTP paths unchanged (`/api/projects`, `/api/site/...`, `/api/public/...`).

**Site Lead web (`sitelead-web/src`)** — `pages/`, `api/`, `auth/`, `components/`, `styles/`. Uses `/api/site/...`.

**Client (`client-web/src`)** — thin: `pages/ProgressPage` + `api.ts`.
