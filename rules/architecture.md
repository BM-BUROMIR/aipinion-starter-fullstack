# starter-fullstack — архитектура и тестирование

## ADRs

- **ADR-1: Single Container** — nginx (static) + uvicorn (API) в одном контейнере, запуск через `entrypoint.sh`
- **ADR-2: JWT через JWKS** — backend валидирует через `auth.aipinion.ru`, без локальных ключей, кеш 1 час
- **ADR-3: In-memory store** — пример CRUD на `dict`, заменить на БД для production
- **ADR-4: Cookie-based auth** — JWT в cookie `auth_token` (`HttpOnly` в prod)
- **ADR-5: Tailwind CSS 4** — через `@tailwindcss/vite` plugin, не PostCSS

## Типовые задачи

### Добавить API endpoint (FastAPI)

1. Создать `backend/app/{feature}/router.py` с FastAPI Router
2. Создать `backend/app/{feature}/models.py` с Pydantic-моделями
3. Зарегистрировать router в `backend/app/main.py`
4. Написать тест `backend/tests/unit/test_{feature}.py`

### Добавить страницу (React)

1. Создать компонент `frontend/src/pages/{Page}.tsx`
2. Добавить route в `frontend/src/App.tsx`
3. Написать тест `frontend/tests/unit/{page}.test.tsx`
4. Написать E2E `frontend/tests/e2e/{page}.spec.ts`

## Тестирование

- **Unit (frontend)** — Vitest + Testing Library, моки для `fetch`
- **Unit (backend)** — pytest с TestClient, in-memory store
- **E2E** — Playwright browser (smoke)
- **Coverage** — 100% mandatory
