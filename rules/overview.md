# starter-fullstack — обзор

Публичный стартер-шаблон для fullstack-приложений экосистемы `aipinion.ru`. Vite + React 19 + FastAPI. Деплоится как единый Docker-контейнер (nginx + uvicorn). Репозиторий public.

## Tech stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 (`@tailwindcss/vite`)
- **Backend:** FastAPI + Pydantic Settings
- **Auth:** JWT RS256 JWKS (backend), cookie `auth_token` (frontend)
- **Тесты:** Vitest + Testing Library, pytest, Playwright (E2E)
- **Docker:** multi-stage (node build → python + nginx), порт 3000

## Структура

```
frontend/src/
├── api/client.ts           # fetch wrapper с credentials
├── auth/                   # AuthProvider, AuthCallback, LoginScreen
├── components/             # AppShell (sidebar), ErrorBoundary
├── pages/                  # Dashboard (example page)
└── hooks/use-auth.ts       # useAuth hook

frontend/tests/{unit,e2e}/  # Vitest + Playwright

backend/app/
├── main.py                 # FastAPI app с CORS + lifespan
├── config.py               # Pydantic Settings
├── auth/middleware.py      # JWT через JWKS
├── health/router.py        # GET /api/health
└── example/                # CRUD example (in-memory)

backend/tests/              # pytest

entrypoint.sh               # nginx + uvicorn startup
Dockerfile                  # multi-stage build
```

## Зависимости

- **`auth/`** — JWT через JWKS; frontend читает cookie `auth_token`. Без auth — `DISABLE_AUTH=true`.
