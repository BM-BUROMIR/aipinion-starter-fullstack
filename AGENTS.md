# AGENTS.md — aipinion-starter-fullstack

## Project context

Публичный стартер-шаблон для fullstack-приложений экосистемы aipinion.ru. Vite + React 19 + FastAPI. Деплоится как единый Docker-контейнер (nginx + uvicorn). Репозиторий public.

## Architecture decisions

- **ADR-1: Single Container** — nginx (static) + uvicorn (API) в одном контейнере, entrypoint.sh управляет запуском
- **ADR-2: JWT via JWKS** — backend валидирует через auth.aipinion.ru, без локальных ключей, кеш 1 час
- **ADR-3: In-memory store** — пример CRUD на dict, заменить на БД для production
- **ADR-4: Cookie-based auth** — JWT в cookie `auth_token` (HttpOnly в prod)
- **ADR-5: Tailwind CSS 4** — через `@tailwindcss/vite` plugin, не PostCSS

## File map

```
frontend/src/
  api/client.ts           # Fetch wrapper with credentials
  auth/                   # AuthProvider, AuthCallback, LoginScreen
  components/             # AppShell (sidebar), ErrorBoundary
  pages/                  # Dashboard (example page)
  hooks/use-auth.ts       # useAuth hook

backend/app/
  main.py                 # FastAPI app with CORS + lifespan
  config.py               # Pydantic Settings
  auth/middleware.py       # JWT via JWKS
  health/router.py        # GET /api/health
  example/                # CRUD example (in-memory)

entrypoint.sh             # nginx + uvicorn startup
Dockerfile                # Multi-stage build
```

## Common tasks

### Add an API endpoint (FastAPI)

1. Create `backend/app/{feature}/router.py` with FastAPI Router
2. Create `backend/app/{feature}/models.py` with Pydantic models
3. Register router in `backend/app/main.py`
4. Write test `backend/tests/unit/test_{feature}.py`

### Add a page (React)

1. Create component in `frontend/src/pages/{Page}.tsx`
2. Add route in `frontend/src/App.tsx`
3. Write test `frontend/tests/unit/{page}.test.tsx`
4. Write E2E `frontend/tests/e2e/{page}.spec.ts`

## Testing

- **Unit (frontend):** Vitest + Testing Library, mocks for fetch
- **Unit (backend):** pytest with TestClient, in-memory store
- **E2E:** Playwright browser (smoke test)
- **Coverage:** 100% mandatory

## Project-specific rules

- **Tailwind CSS 4** — через Vite plugin, не CLI
- **entrypoint.sh** — не менять без понимания порядка запуска nginx/uvicorn
- Шаблон публичный — не содержит секретов и prod-конфигов
- Не снижать порог coverage ниже 100%
