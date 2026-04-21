# starter-fullstack — команды и env

## Frontend

```bash
cd frontend && npm install
npm run dev              # Vite :5173
npm run build            # TS check + build
npm run lint
npm run test:coverage    # Vitest 100%
```

## Backend

```bash
cd backend && pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
ruff check . && ruff format --check .
pytest --cov=app --cov-fail-under=100
```

## Docker

```bash
docker compose up --build  # :3000
```

## Env vars

| Переменная     | Назначение                                      |
| -------------- | ----------------------------------------------- |
| `DISABLE_AUTH` | `true` — отключить JWT для локальной разработки |
