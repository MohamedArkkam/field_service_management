# Client progress web (`apps/client-web`)

React + TypeScript (Vite) — **Client progress link** (read-only).

## M2
- Route: `/p/{token}` → `GET /api/public/p/{token}`
- Shows **published** progress only (title, note, optional photo URL, rating, date)
- Never shows bills, wages, Admin priority/value, or drafts

```bash
# API on :8080
npm install
npm run dev
```

Dev server defaults to **http://localhost:5174** (proxies `/api` → API).
