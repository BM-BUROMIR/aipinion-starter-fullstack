# Architecture

## Overview

This is a full-stack starter template following the aipinion.ru project conventions. It combines a React frontend with a FastAPI backend, deployed as a single Docker container via Coolify.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Container                      │
│                                                          │
│  ┌──────────────┐    proxy /api/    ┌──────────────┐    │
│  │   nginx:3000  │ ───────────────► │ uvicorn:8000 │    │
│  │  static files │                   │   FastAPI     │    │
│  └──────────────┘                   └──────┬───────┘    │
│         ▲                                   │            │
│         │ SPA fallback                      │ JWKS       │
│  /var/www/html/                             ▼            │
│  (Vite build output)              auth.aipinion.ru       │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

1. Browser requests arrive at nginx (port 3000)
2. Static files (JS, CSS, images) served directly from `/var/www/html`
3. API requests (`/api/*`) proxied to uvicorn (port 8000)
4. SPA fallback: all other routes serve `index.html`

## Authentication Flow

```
Browser                 Frontend                Auth Server              Backend
  │                       │                         │                       │
  │──── visit app ───────►│                         │                       │
  │◄─── LoginScreen ──────│                         │                       │
  │                       │                         │                       │
  │──── click login ──────►                         │                       │
  │──── redirect ─────────────────────────────────►│                       │
  │◄─── callback?token=JWT ────────────────────────│                       │
  │                       │                         │                       │
  │──── AuthCallback ────►│                         │                       │
  │     set cookie         │                         │                       │
  │◄─── redirect / ───────│                         │                       │
  │                       │                         │                       │
  │──── API request ──────►──── fetch /api/* ──────────────────────────────►│
  │                       │     (cookie: auth_token) │    verify JWT via    │
  │                       │                         │◄──── JWKS endpoint ──│
  │◄─── response ─────────◄────────────────────────────────────────────────│
```

## Frontend Architecture

- **AuthProvider**: reads `auth_token` cookie, decodes JWT payload, provides user context
- **AuthCallback**: handles OAuth redirect, sets cookie, redirects to app
- **LoginScreen**: redirects to auth.aipinion.ru for Telegram OAuth
- **AppShell**: sidebar layout with navigation and user info
- **ErrorBoundary**: catches React rendering errors gracefully

### Key Decisions

- No client-side routing library (simple `window.location.pathname` for now)
- JWT decoded client-side for display only; backend validates signatures via JWKS
- Tailwind CSS 4 with Vite plugin (no PostCSS config needed)

## Backend Architecture

- **FastAPI** with Pydantic Settings for configuration
- **JWT middleware** validates tokens via JWKS endpoint from auth.aipinion.ru
- **In-memory store** for the example CRUD (replace with a database)
- **Health endpoint** for Docker healthcheck and monitoring

### Route Protection

- Public routes: `GET /api/health`, `GET /api/examples`, `GET /api/examples/{id}`
- Protected routes: `POST/PUT/DELETE /api/examples/*` (require valid JWT)

## Deployment

- **Single Dockerfile**: multi-stage build (node for frontend, python for backend)
- **entrypoint.sh**: starts uvicorn in background, then nginx in foreground
- **Coolify**: auto-deploy on push to main, env vars managed via `scripts/coolify.sh`

## Testing Strategy

| Layer         | Tool                                        | Threshold              |
| ------------- | ------------------------------------------- | ---------------------- |
| Frontend unit | Vitest + Testing Library                    | 100% coverage          |
| Frontend E2E  | Playwright                                  | Smoke tests            |
| Backend unit  | pytest                                      | 100% coverage          |
| Backend lint  | ruff                                        | Zero errors            |
| Frontend lint | ESLint                                      | Zero errors            |
| Format        | Prettier (frontend) + ruff format (backend) | Enforced in pre-commit |

## Environment Variables

| Variable               | Where    | Description                            |
| ---------------------- | -------- | -------------------------------------- |
| `AUTH_SERVER_URL`      | Backend  | Auth server base URL                   |
| `APP_SLUG`             | Backend  | App identifier for RBAC                |
| `COOKIE_NAME`          | Backend  | JWT cookie name                        |
| `CORS_ORIGINS`         | Backend  | Allowed CORS origins (comma-separated) |
| `DISABLE_AUTH`         | Backend  | Skip JWT validation (dev/test)         |
| `VITE_AUTH_SERVER_URL` | Frontend | Auth server URL for login redirect     |
| `VITE_APP_SLUG`        | Frontend | App identifier for auth flow           |
| `VITE_API_URL`         | Frontend | API base URL (default: `/api`)         |
