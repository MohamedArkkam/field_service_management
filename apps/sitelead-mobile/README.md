# Site Lead mobile (`apps/sitelead-mobile`)

Expo (React Native) app for **Site Lead** — online-required fast path against Core API.

## What it does (M4)
- Login (`SITE_LEAD` only)
- List assigned projects
- Progress: create draft (title / note / optional photo URL) → publish with rating 1–5
- Purchases: create/list; update amount paid → Unpaid / Partial / Paid
- Workers + attendance (daily vs monthly labour charges created by API)

**Not in M4:** offline sync, Client finance, Admin priority/value UI, native Android Studio builds.

## Prerequisites
1. Core API running (`apps/api`, port **8080**)
2. Admin has created a Site Lead user and assigned them to a project
3. Expo Go on a physical phone (same Wi‑Fi as your PC)
4. Node.js 20+ recommended

## Configure API URL (important for phones)
`localhost` on the phone points at the phone — use your PC’s LAN IP.

```bash
cd apps/sitelead-mobile
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.42:8080
```

Find your LAN IP (Windows): `ipconfig` → IPv4 Address.

Ensure Windows Firewall allows inbound TCP **8080**, and API CORS/JWT setup is unchanged (React Native does not use browser CORS).

`app.json` enables Android cleartext HTTP for local LAN testing.

## Run with Expo Go
```bash
cd apps/sitelead-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. Sign in with a Site Lead account (not Admin).

### Simulator / web note
Emulators may use `http://10.0.2.2:8080` (Android emulator) or `http://localhost:8080` (iOS sim / web). Physical phone → LAN IP.

## API surface used
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/site/projects`
- Progress: `GET/POST …/progress`, `POST …/progress/{id}/publish`
- Purchases: `GET/POST …/purchases`, `PUT …/purchases/{id}/payment`
- Workers/attendance: `GET/POST …/workers`, `GET/POST …/attendance`

## Errors
Network/API failures show a message and **Retry**. No offline queue — reconnect and retry.
