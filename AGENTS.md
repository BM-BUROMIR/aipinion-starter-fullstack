# aipinion-starter-fullstack — AGENTS.md

## Quick Context

- **Stack:** Vite + React 19 (TypeScript) + FastAPI (Python) + Tailwind CSS 4
- **Purpose:** Public starter template for full-stack aipinion.ru applications
- **Repository:** BM-BUROMIR/aipinion-starter-fullstack
- **Deploy:** Coolify (single Docker container: nginx + uvicorn)

## Architecture Decision Records

### ADR-001: Single Container Deployment

Both frontend (nginx serving static) and backend (uvicorn) run in one container.
Simplifies deployment via Coolify. entrypoint.sh starts uvicorn as background process,
then nginx in foreground. Nginx proxies /api/ to uvicorn.

### ADR-002: JWT via JWKS (No Local Keys)

Backend validates JWT tokens by fetching public keys from auth.aipinion.ru JWKS endpoint.
No private keys stored in the app. JWKS client caches keys for 1 hour.

### ADR-003: In-Memory Store for Examples

The example CRUD uses a Python dict. Intended as a starting point — replace with
a real database (PostgreSQL, SQLite, etc.) for production use.

### ADR-004: Cookie-Based Auth Token

JWT stored as `auth_token` cookie (HttpOnly in production). Frontend reads it for
display purposes only. Backend validates the signature on every protected request.

### ADR-005: Tailwind CSS 4 with Vite Plugin

Uses @tailwindcss/vite plugin instead of PostCSS. CSS configuration via `@import "tailwindcss"`.

## Quality Gates

Pre-commit (lint-staged):

- ESLint --fix + Prettier --write for \*.{ts,tsx,js,jsx}
- Prettier --write for \*.{json,md,css,html}
- Ruff check --fix + format for backend/\*_/_.py

Pre-push (full check):

1. `npm run lint` + `npm run format:check`
2. `npm run build`
3. `npm run test:coverage` (Vitest, threshold 100%)
4. `cd backend && ruff check . && ruff format --check .`
5. `cd backend && pytest --cov=app --cov-fail-under=100`
6. `npm run test:e2e` (Playwright)

Push rejected on any failure.

## File Map

```
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # Root component with routing
│   │   ├── main.tsx                # React entry point
│   │   ├── index.css               # Tailwind CSS import
│   │   ├── api/client.ts           # Fetch wrapper with credentials
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx     # JWT context, cookie auth_token
│   │   │   ├── AuthCallback.tsx     # OAuth callback handler
│   │   │   └── LoginScreen.tsx      # Redirect to auth server
│   │   ├── components/
│   │   │   ├── AppShell.tsx         # Sidebar + header + content
│   │   │   └── ErrorBoundary.tsx    # Error boundary
│   │   ├── pages/
│   │   │   └── Dashboard.tsx        # Example page with health check
│   │   ├── hooks/use-auth.ts        # useAuth hook
│   │   └── types/index.ts           # Shared types
│   ├── tests/unit/                  # Vitest unit tests
│   ├── tests/e2e/                   # Playwright E2E tests
│   ├── nginx.conf                   # Production nginx config
│   └── *.config.ts                  # Vite, Vitest, Playwright, Tailwind configs
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app with CORS + lifespan
│   │   ├── config.py                # Pydantic Settings
│   │   ├── auth/middleware.py        # JWT via JWKS
│   │   ├── auth/models.py           # AuthUser model
│   │   ├── health/router.py         # GET /api/health
│   │   ├── example/router.py        # CRUD example (in-memory)
│   │   └── example/models.py        # Example Pydantic models
│   ├── tests/                       # pytest tests
│   ├── requirements.txt             # Production dependencies
│   └── requirements-dev.txt         # Dev/test dependencies
├── Dockerfile                       # Multi-stage build
├── entrypoint.sh                    # uvicorn + nginx startup
├── docker-compose.yml               # Local Docker setup
├── scripts/coolify.sh               # Deployment helper
└── package.json                     # Root: husky, lint-staged
```

## Common Tasks

### Add an API endpoint (FastAPI)

1. Create `backend/app/{feature}/router.py` with FastAPI Router
2. Create `backend/app/{feature}/models.py` with Pydantic models
3. Register router in `backend/app/main.py`
4. Write test `backend/tests/unit/test_{feature}.py`
5. Check coverage: `cd backend && pytest --cov=app --cov-report=term-missing`

### Add a page (React)

1. Create component in `frontend/src/pages/{Page}.tsx`
2. Add route in `frontend/src/App.tsx`
3. Write test `frontend/tests/unit/{page}.test.tsx`
4. Write E2E `frontend/tests/e2e/{page}.spec.ts`

### Deploy

```bash
./scripts/coolify.sh push-test   # push → deploy → smoke
./scripts/coolify.sh sync-env    # update env vars
./scripts/coolify.sh deploy      # manual redeploy
```

## External Integrations

- **auth.aipinion.ru** — JWT RS256 via JWKS endpoint, RBAC roles
- **Coolify** — deploy, env vars sync, healthcheck

## Testing Strategy

- **Unit (frontend):** Vitest + Testing Library, mocks for fetch
- **Unit (backend):** pytest with TestClient, in-memory store
- **E2E:** Playwright browser (smoke test)
- **Coverage:** 100% mandatory, enforced in pre-push

## Do NOT

- Push without passing all tests (`--no-verify` is forbidden)
- Commit `.env`, `.env.prod`, `.coolify.env`
- Change `scripts/coolify.sh` without coordination
- Delete tests
- Lower coverage threshold below 100%
- Add `any` in TypeScript (ESLint: error)
