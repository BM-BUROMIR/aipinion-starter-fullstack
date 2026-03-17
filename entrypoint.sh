#!/bin/bash
set -e

# Start backend
cd /app
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# Wait for backend
for i in $(seq 1 15); do
  if curl -sf http://127.0.0.1:8000/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Start nginx (foreground)
nginx -g 'daemon off;'
