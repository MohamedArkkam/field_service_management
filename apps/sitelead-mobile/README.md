# Site Lead mobile (`apps/sitelead-mobile`)

Expo (React Native) app for **Site Lead** — online-required fast path against Core API.

## What it does (M4)
- Login (`SITE_LEAD` only)
- List assigned projects
- Progress: create draft (title / note / optional photo URL) → publish with rating 1–5
- Purchases: create/list; update amount paid → Unpaid / Partial / Paid
- Workers + attendance (daily vs monthly labour charges created by API)

**Not in M4:** offline sync, Client finance, Admin priority/value UI, native Android Studio builds, Expo SDK downgrade for older phones.

## Device / demo notes
- **Expo Go** for the current SDK needs a recent device — typically **Android 12+** (or a matching emulator). Older phones (e.g. Galaxy S9+) often cannot install/run current Expo Go.
- **Do not** downgrade Expo or set up Android Studio for v1 unless explicitly requested.
- **Fallback demo path (recommended when Expo Go is unavailable):** run Core API and exercise Site Lead flows via **Swagger** (`http://localhost:8080/swagger-ui.html`) or curl/Postman against `/api/site/...` (same JWT login as the app).

## Prerequisites
1. Core API running (`apps/api`, port **8080**)
2. Admin has created a Site Lead user and assigned them to a project
3. To run the app UI: Expo Go on **Android 12+** (or emulator), same Wi‑Fi as your PC — **or** use the Swagger/API fallback above
4. Node.js 20+ recommended (only if starting Expo)

## Configure API URL (important for phones / emulators)
`localhost` on a physical phone points at the phone — use your PC’s LAN IP.

```bash
cd apps/sitelead-mobile
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.42:8080
```

Find your LAN IP (Windows): `ipconfig` → IPv4 Address.

- Android emulator often uses `http://10.0.2.2:8080`
- iOS simulator / web may use `http://localhost:8080`

Ensure Windows Firewall allows inbound TCP **8080**. React Native does not use browser CORS.

`app.json` enables Android cleartext HTTP for local LAN testing.

## Run with Expo Go (Android 12+ or emulator)
```bash
cd apps/sitelead-mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. Sign in with a Site Lead account (not Admin).

If Expo Go will not install/run on the device, skip this and demo via **Swagger / API** instead.

## API surface used
- `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/site/projects`
- Progress: `GET/POST …/progress`, `POST …/progress/{id}/publish`
- Purchases: `GET/POST …/purchases`, `PUT …/purchases/{id}/payment`
- Workers/attendance: `GET/POST …/workers`, `GET/POST …/attendance`

## Errors
Network/API failures show a message and **Retry**. No offline queue — reconnect and retry.
