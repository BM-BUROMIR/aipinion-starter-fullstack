# CLAUDE.md — aipinion-starter-fullstack

## Project

Public starter template for full-stack applications using the aipinion.ru conventions.
Stack: Vite + React 19 (TypeScript) + FastAPI (Python) + Tailwind CSS 4.
Deployed via Coolify as a single Docker container (nginx + uvicorn).

## Architecture

```
frontend/          React 19 + Vite + TypeScript + Tailwind CSS 4
├── src/
│   ├── api/       Fetch wrapper with credentials
│   ├── auth/      AuthProvider, AuthCallback, LoginScreen
│   ├── components/  AppShell (sidebar layout), ErrorBoundary
│   ├── pages/     Dashboard (example page)
│   ├── hooks/     use-auth custom hook
│   └── types/     Shared TypeScript types
├── tests/unit/    Vitest + Testing Library
└── tests/e2e/     Playwright browser tests

backend/           FastAPI + Pydantic Settings
├── app/
│   ├── auth/      JWT middleware (JWKS validation)
│   ├── health/    GET /api/health
│   └── example/   CRUD routes (in-memory store)
└── tests/         pytest

Docker:            Multi-stage (node build → python + nginx)
```

## Commands

```bash
# Frontend
cd frontend && npm install
npm run dev              # Vite dev server (port 5173)
npm run build            # TypeScript check + production build
npm run lint             # ESLint
npm run test:coverage    # Vitest with 100% coverage

# Backend
cd backend && pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
ruff check .             # Lint
ruff format --check .    # Format check
pytest --cov=app --cov-fail-under=100  # Tests with 100% coverage

# Root (husky + lint-staged)
npm install
npm run format:check     # Prettier check

# Docker
docker compose up --build  # Full app on port 3000
```

## Quality Gates

Pre-commit (lint-staged):

- ESLint --fix + Prettier --write for frontend/\*.{ts,tsx}
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

## Auth

Integrated with auth.aipinion.ru:

- Frontend: reads `auth_token` cookie, decodes JWT for display
- Backend: validates JWT signature via JWKS endpoint (RS256)
- Set `DISABLE_AUTH=true` for local development

## Deployment

```bash
scripts/coolify.sh info        # Show app status
scripts/coolify.sh deploy      # Trigger redeployment
scripts/coolify.sh sync-env    # Push .env.prod to Coolify
scripts/coolify.sh push-test   # Push + wait + smoke test
```

## Do NOT

- Push without passing all tests (`--no-verify` is forbidden)
- Commit `.env`, `.env.prod`, `.coolify.env`
- Lower coverage threshold below 100%
- Add `any` in TypeScript (ESLint: error)
- Delete tests or skip quality gates
