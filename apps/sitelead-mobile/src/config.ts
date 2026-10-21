/**
 * Base URL for Core API.
 * On a physical phone with Expo Go, set EXPO_PUBLIC_API_URL to http://<LAN-IP>:8080
 * (localhost points at the phone itself).
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8080'
).trim()
