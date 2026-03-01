// Central API base URL.
// In production (Vercel), set VITE_API_URL to your Render backend URL.
// Locally, this falls back to http://localhost:5000
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default API_BASE;
