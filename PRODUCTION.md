# Production readiness: Backend & Frontend

Use this checklist and configuration when moving the chat application to production.

---

## Backend (FastAPI)

### 1. Environment variables (required)

Set these in your host (e.g. Railway, Render, Fly.io, Docker, or server env). **Never commit real values.**

| Variable | Description | Example (production) |
|----------|-------------|----------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` (use SSL if required: `?sslmode=require`) |
| `SECRET_KEY` | JWT signing key; must be strong and secret | Generate: `openssl rand -hex 32` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://yourdomain.com,https://www.yourdomain.com` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional; default 60 | `60` or higher |
| `ALGORITHM` | Optional; default HS256 | `HS256` |

- **SECRET_KEY**: If you keep the default `change-me-in-production-...`, tokens are insecure. Always set a random key in production.
- **CORS_ORIGINS**: Must include the exact origin(s) of your frontend (scheme + host + port if non-default). No trailing slash.

### 2. Database

- Run migrations before first deploy: `alembic upgrade head` (from backend root).
- Prefer a managed PostgreSQL (e.g. Neon, Supabase, RDS) with backups and SSL.
- In production, use a connection pool; your app already uses `pool_pre_ping=True`.

### 3. Running the server

- Do **not** use `uvicorn app.main:app --reload` in production (reload is for development).
- Use: `uvicorn app.main:app --host 0.0.0.0 --port 8000` (or your port).
- For production ASGI servers consider **Gunicorn + Uvicorn workers**:
  ```bash
  gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
  ```
- Ensure the process runs with the same Python that has `websockets` installed (WebSocket support).

### 4. Security

- HTTPS only in production; set `CORS_ORIGINS` to `https://` origins.
- No default/dev `SECRET_KEY`; no default dev `DATABASE_URL` in production.
- `/docs` and `/redoc` are available by default; consider disabling or protecting them if you don’t want public API docs (e.g. via env flag or reverse proxy).

### 5. Health check

- Use `GET /health` for load balancers and orchestrators.
- Optional: add a DB check (see below) so health fails when DB is down.

### 6. Logging

- Use structured logging and set log level via env (e.g. `LOG_LEVEL=INFO`). The app uses Python `logging`; configure it in production (e.g. in `main.py` or a logging config).

---

## Frontend (Next.js)

### 1. Environment variables

Build-time (for client-side code):

| Variable | Description | Example (production) |
|----------|-------------|----------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (no trailing slash) | `https://api.yourdomain.com` |

- This is used for REST and for the WebSocket URL (ws/wss is derived from the same host).
- In production, use **HTTPS**; the frontend will use **WSS** for the WebSocket automatically when you use `https://` in `NEXT_PUBLIC_API_URL`.

### 2. Build and run

- Build: `npm run build`
- Run: `npm run start` (or your host’s start command).
- Do not use `npm run dev` in production.

### 3. Hosting

- Works on Vercel, Netlify, Node on a VPS, Docker, etc.
- Set `NEXT_PUBLIC_API_URL` in the host’s environment (or in the build settings) to your production backend URL.

### 4. CORS

- Backend `CORS_ORIGINS` must include the frontend’s production origin (e.g. `https://yourdomain.com`). If you use a different subdomain for API (e.g. `https://api.yourdomain.com`), both frontend and API origins must be allowed if needed.

---

## WebSocket in production

- Backend and frontend must use **WSS** (WebSocket over TLS) when the site is served over HTTPS.
- Your frontend already builds the WebSocket URL from `NEXT_PUBLIC_API_URL` (e.g. `https://...` → `wss://...`). Ensure the backend is served over HTTPS so WSS works.
- If you put the API behind a reverse proxy (Nginx, Cloudflare), enable WebSocket proxying for `/ws/chat`.

---

## Checklist summary

**Backend**

- [ ] Set `DATABASE_URL` (production PostgreSQL, SSL if required).
- [ ] Set `SECRET_KEY` (e.g. `openssl rand -hex 32`).
- [ ] Set `CORS_ORIGINS` to production frontend URL(s).
- [ ] Run `alembic upgrade head`.
- [ ] Run with `uvicorn` (or Gunicorn + Uvicorn) without `--reload`.
- [ ] Serve over HTTPS so WSS works.

**Frontend**

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL (e.g. `https://api.yourdomain.com`).
- [ ] Run `npm run build` and `npm run start` (or host’s equivalent).
- [ ] Serve over HTTPS.

**Both**

- [ ] Confirm WebSocket connects (wss://) and messages send/receive.
- [ ] Confirm login, token refresh (if any), and message history load correctly.

---

## Optional improvements

- **Backend**: Add rate limiting (e.g. slowapi) on login and public endpoints.
- **Backend**: Add request ID middleware and correlation IDs in logs.
- **Frontend**: Add error boundary and a global API error handler (e.g. redirect to login on 401).
- **Frontend**: Consider server-side redirect for `/` to `/login` or `/dashboard` based on auth (see below).
