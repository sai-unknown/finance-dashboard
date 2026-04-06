// If `REACT_APP_API_URL` is not set, use same-origin so Vercel rewrites apply.
// - Vercel: fetches `/transactions` → rewritten to `/api/transactions`
// - Custom API host: set `REACT_APP_API_URL=https://your-api.example.com`
const API_BASE_RAW = process.env.REACT_APP_API_URL || "";

// Remove trailing slash so we don't end up with double slashes in fetch URLs.
export const API_BASE = API_BASE_RAW.replace(/\/$/, "");
