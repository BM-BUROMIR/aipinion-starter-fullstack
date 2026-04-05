# CLAUDE.md — aipinion-starter-fullstack

## Обзор

Стартер-шаблон для fullstack-приложений aipinion.ru. Единый Docker-контейнер (nginx + uvicorn).

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS 4 (`@tailwindcss/vite`)
- **Backend:** FastAPI + Pydantic Settings
- **Auth:** JWT RS256 JWKS (backend), cookie `auth_token` (frontend)
- **Тесты:** Vitest + Testing Library, pytest, Playwright (E2E)
- **Docker:** Multi-stage (node build → python + nginx), порт 3000

## Структура проекта

```
frontend/          React 19 + Vite + TS + Tailwind 4
├── src/{api, auth, components, pages, hooks, types}/
├── tests/unit/    Vitest + Testing Library
└── tests/e2e/     Playwright

backend/           FastAPI + Pydantic Settings
├── app/{auth, health, example}/
└── tests/         pytest

entrypoint.sh      nginx + uvicorn в одном контейнере
```

## Команды

```bash
# Frontend
cd frontend && npm install
npm run dev              # Vite :5173
npm run build            # TS check + build
npm run lint
npm run test:coverage    # Vitest 100%

# Backend
cd backend && pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
ruff check . && ruff format --check .
pytest --cov=app --cov-fail-under=100

# Docker
docker compose up --build  # :3000
```

## Env vars

| Переменная     | Назначение                                      |
| -------------- | ----------------------------------------------- |
| `DISABLE_AUTH` | `true` — отключить JWT для локальной разработки |

## Зависимости

- **auth/** — JWT через JWKS; frontend читает cookie `auth_token`. Без auth: `DISABLE_AUTH=true`

## Правила проекта

- **Tailwind CSS 4** через Vite plugin, не CLI
- **entrypoint.sh** — nginx + uvicorn в одном контейнере
- **In-memory store** в backend — пример, заменить на БД
- Шаблон публичный — без секретов и prod-конфигов
