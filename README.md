# aipinion-starter-fullstack

A production-ready starter template for full-stack web applications following [aipinion.ru](https://aipinion.ru) project conventions.

## Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Backend  | FastAPI + Pydantic Settings + PyJWT           |
| Auth     | JWT (RS256) via auth.aipinion.ru JWKS         |
| Icons    | Lucide React                                  |
| Testing  | Vitest + Playwright + pytest                  |
| Linting  | ESLint + Prettier + ruff                      |
| Deploy   | Docker (nginx + uvicorn) + Coolify            |

## Quick Start

### Prerequisites

- Node.js >= 20
- Python >= 3.12
- npm

### 1. Clone and install

```bash
git clone https://github.com/BM-BUROMIR/aipinion-starter-fullstack.git
cd aipinion-starter-fullstack

# Root dependencies (husky, lint-staged, prettier)
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && pip install -r requirements.txt -r requirements-dev.txt && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set DISABLE_AUTH=true for local development
```

### 3. Run development servers

```bash
# Terminal 1: Backend
cd backend && DISABLE_AUTH=true uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend (proxies /api to backend)
cd frontend && npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Run with Docker

```bash
docker compose up --build
# App available at http://localhost:3000
```

## Project Structure

```
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/client.ts        # Fetch wrapper with credentials
│   │   ├── auth/                # AuthProvider, AuthCallback, LoginScreen
│   │   ├── components/          # AppShell (sidebar layout), ErrorBoundary
│   │   ├── pages/               # Dashboard (example page)
│   │   ├── hooks/               # Custom React hooks
│   │   └── types/               # Shared TypeScript types
│   ├── tests/unit/              # Vitest unit tests
│   ├── tests/e2e/               # Playwright browser tests
│   └── nginx.conf               # Production nginx config
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Pydantic Settings
│   │   ├── auth/                # JWT middleware (JWKS validation)
│   │   ├── health/              # Health check endpoint
│   │   └── example/             # CRUD example (in-memory)
│   └── tests/                   # pytest tests
├── Dockerfile                   # Multi-stage: frontend build + backend serve
├── entrypoint.sh                # Starts uvicorn + nginx
├── docker-compose.yml           # Local Docker setup
├── scripts/coolify.sh           # Deployment helper
└── docs/architecture.md         # Architecture documentation
```

## API Endpoints

| Method | Path                 | Auth | Description       |
| ------ | -------------------- | ---- | ----------------- |
| GET    | `/api/health`        | No   | Health check      |
| GET    | `/api/examples`      | No   | List all examples |
| GET    | `/api/examples/{id}` | No   | Get example by ID |
| POST   | `/api/examples`      | Yes  | Create example    |
| PUT    | `/api/examples/{id}` | Yes  | Update example    |
| DELETE | `/api/examples/{id}` | Yes  | Delete example    |

## Authentication

This template integrates with [auth.aipinion.ru](https://auth.aipinion.ru) for centralized authentication.

### How it works

1. **Login**: User clicks "Sign in with Telegram" and is redirected to the auth server
2. **Callback**: Auth server redirects back with a JWT token in the URL
3. **Cookie**: Frontend stores the JWT as an `auth_token` cookie
4. **API calls**: Cookie is sent automatically with every API request (`credentials: 'include'`)
5. **Validation**: Backend validates JWT signature via JWKS endpoint (RS256)

### Development mode

Set `DISABLE_AUTH=true` in your environment to bypass JWT validation during development. A mock admin user will be injected automatically.

## Testing

All tests must pass with 100% coverage before pushing.

```bash
# Frontend unit tests
cd frontend && npm run test:coverage

# Frontend E2E tests
cd frontend && npm run test:e2e

# Backend tests
cd backend && pytest --cov=app --cov-fail-under=100

# Backend lint
cd backend && ruff check . && ruff format --check .

# Frontend lint
cd frontend && npm run lint
```

## Quality Gates

### Pre-commit (automatic via husky)

- **TypeScript files**: ESLint --fix + Prettier --write
- **JSON/MD/CSS/HTML**: Prettier --write
- **Python files**: ruff check --fix + ruff format

### Pre-push (automatic via husky)

1. ESLint + Prettier format check
2. TypeScript compilation + Vite build
3. Vitest with 100% coverage threshold
4. ruff lint + format check
5. pytest with 100% coverage threshold
6. Playwright E2E tests

Push is rejected if any check fails.

## Deployment

Deploy via Coolify using the included helper script:

```bash
# Show app status and environment variables
./scripts/coolify.sh info

# Trigger redeployment
./scripts/coolify.sh deploy

# Push .env.prod values to Coolify
./scripts/coolify.sh sync-env

# Full workflow: git push → wait for deploy → smoke test
./scripts/coolify.sh push-test
```

### Docker Build

The `Dockerfile` uses a multi-stage build:

1. **Stage 1** (node:20-alpine): Install dependencies, build frontend with Vite
2. **Stage 2** (python:3.12-slim): Install nginx + Python deps, copy built frontend, configure healthcheck

The container exposes port 3000. Nginx serves static files and proxies `/api/` to uvicorn.

## Environment Variables

| Variable               | Default                     | Description                    |
| ---------------------- | --------------------------- | ------------------------------ |
| `AUTH_SERVER_URL`      | `https://auth.aipinion.ru`  | Auth server base URL           |
| `APP_SLUG`             | `starter`                   | App identifier for RBAC roles  |
| `COOKIE_NAME`          | `auth_token`                | Name of the JWT cookie         |
| `CORS_ORIGINS`         | `http://localhost:5173,...` | Allowed CORS origins           |
| `DISABLE_AUTH`         | `false`                     | Skip JWT validation (dev only) |
| `VITE_AUTH_SERVER_URL` | `https://auth.aipinion.ru`  | Auth server URL (frontend)     |
| `VITE_APP_SLUG`        | `starter`                   | App slug (frontend)            |
| `VITE_API_URL`         | `/api`                      | API base URL (frontend)        |

## Customization Guide

### Rename the app

1. Update `APP_SLUG` in `.env.example` and environment
2. Update `VITE_APP_SLUG` for the frontend
3. Update `package.json` name fields
4. Update `CLAUDE.md` and `AGENTS.md`

### Add a database

1. Replace the in-memory `_store` dict in `backend/app/example/router.py`
2. Add your ORM/driver to `backend/requirements.txt`
3. Update `docker-compose.yml` to add a database service
4. Update tests to use test database fixtures

### Add a new page

1. Create `frontend/src/pages/YourPage.tsx`
2. Add routing logic in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/AppShell.tsx`
4. Write unit test in `frontend/tests/unit/your-page.test.tsx`
5. Write E2E test in `frontend/tests/e2e/your-page.spec.ts`

### Add a new API endpoint

1. Create `backend/app/yourfeature/router.py` and `models.py`
2. Register the router in `backend/app/main.py`
3. Write tests in `backend/tests/unit/test_yourfeature.py`
4. Ensure 100% coverage

## License

MIT — see [LICENSE](LICENSE) for details.
