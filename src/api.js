// Central place for the API base URL.
//
// - Local dev: leave VITE_API_BASE unset. Requests go to "/api/..." and Vite's
//   dev-server proxy (see vite.config.js) forwards them to the local Express
//   backend on http://localhost:5000.
// - Production (Vercel): set VITE_API_BASE to your deployed backend URL
//   (e.g. https://job-board-91q8.onrender.com) so the static frontend talks to
//   the Render backend.
const RAW_BASE = import.meta.env.VITE_API_BASE || ''
export const API_BASE = RAW_BASE.replace(/\/$/, '')

export const apiUrl = (path) => `${API_BASE}${path}`
