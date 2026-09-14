// In local development, API_BASE is empty string (uses Vite proxy to localhost:5000)
// In production on Vercel, set VITE_API_URL=https://<your-render-backend-url>.onrender.com
export const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
