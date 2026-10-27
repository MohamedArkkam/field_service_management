# Site Lead web (`apps/sitelead-web`)

Mobile-responsive **React + TypeScript** door for **Site Lead** — phone browser first, online required. Uses Core API `/api/site/...` (same contracts as the future native app).

**Not** merged into Admin web. Native Expo lives in `apps/sitelead-mobile` for later.

## Screens
- Login (`SITE_LEAD` only — other roles rejected)
- My sites (assigned projects)
- Project home → Progress / Purchases / Workers
- Progress: draft create → publish (no rating) / delete draft
- Purchases: create + update amount paid (Unpaid / Partial / Paid)
- Workers + attendance (daily / monthly)

## Run
```bash
# API must be on :8080
cd apps/sitelead-web
npm install
npm run dev
```

Open http://localhost:5175  
Demo: `sitelead@sitedirect.local` / `Lead1234!`

## API surface
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/site/projects`
- Progress: `GET/POST …/progress`, `POST …/progress/{id}/publish`, `DELETE …/progress/{id}`
- Purchases: `GET/POST …/purchases`, `PUT …/purchases/{id}/payment`
- Workers/attendance: `GET/POST …/workers`, `GET/POST …/attendance`

Vite proxies `/api` → `http://localhost:8080`.
