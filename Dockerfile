# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

COPY frontend/ .

ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Python backend + nginx
FROM python:3.12-slim

WORKDIR /app

# Install nginx and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends nginx curl && \
    rm -rf /var/lib/apt/lists/*

# Backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend code
COPY backend/ .

# Frontend (built static files)
COPY --from=frontend-build /frontend/dist /var/www/html

# Nginx config
COPY frontend/nginx.conf /etc/nginx/sites-available/default

# Startup script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
  CMD curl -sf http://localhost:3000/api/health || exit 1

CMD ["/entrypoint.sh"]
