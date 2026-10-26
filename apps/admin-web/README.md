# Admin web (`apps/admin-web`)

React + TypeScript (Vite) — **Admin / Owner** door.

## Source layout

```
src/
  app/                 # App shell, routes, RequireAuth
  features/
    auth/              # Login + auth API
    projects/          # List, detail, edit, new + projects API
    users/             # List, create + users API
    liabilities/       # Outstanding liabilities + API
  shared/
    components/        # Chrome, headers, dialogs, drawers
    styles/            # tokens.css + app.css
    types/             # Shared TS types
    api/http.ts        # Token + fetch helper
```

## Screens
- Login (ADMIN only)
- Users: create / deactivate / reactivate Site Lead / Client
- Projects: portfolio, detail, edit (assignments, archive/restore)
- **Liabilities:** outstanding Unpaid/Partial purchases + open labour charges

## Run
```bash
# API must be running on :8080
npm install
npm run dev
```

Open http://localhost:5173  
Default admin: `admin@sitedirect.local` / `Admin123!`
