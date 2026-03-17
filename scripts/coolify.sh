#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════
# Coolify deployment helper — aipinion standard
#
# Usage:
#   ./scripts/coolify.sh info          Show app status & env vars
#   ./scripts/coolify.sh deploy        Trigger redeployment
#   ./scripts/coolify.sh sync-env      Push .env.prod to Coolify
#   ./scripts/coolify.sh wait-deploy   Wait for deploy completion
#   ./scripts/coolify.sh push-test     Push → wait → smoke
#   ./scripts/coolify.sh smoke         Run smoke tests
#   ./scripts/coolify.sh logs          View recent logs
#   ./scripts/coolify.sh prod-release  Tag-based prod deploy (optional)
# ═══════════════════════════════════════════════════════════════

# --- Project-specific config (override per project) ---
EXPECTED_GIT_REPO="${EXPECTED_GIT_REPO:-}"
HEALTH_URL="${HEALTH_URL:-}"

# --- Config ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# --- Load Coolify credentials ---
COOLIFY_ENV="$PROJECT_DIR/.coolify.env"
if [[ -f "$COOLIFY_ENV" ]]; then
  source "$COOLIFY_ENV"
fi

COOLIFY_URL="${COOLIFY_URL:-}"
COOLIFY_TOKEN="${COOLIFY_TOKEN:-}"
COOLIFY_APP_UUID="${COOLIFY_APP_UUID:-}"

_require() {
  if [[ -z "${!1:-}" ]]; then
    echo "ERROR: $1 is not set. Set it in .coolify.env or as env var." >&2
    exit 1
  fi
}

_require_all() {
  _require COOLIFY_URL
  _require COOLIFY_TOKEN
  _require COOLIFY_APP_UUID
}

_verify_project() {
  if [[ -z "$EXPECTED_GIT_REPO" ]]; then return; fi
  local repo
  repo=$(_api GET "/applications/$COOLIFY_APP_UUID" \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('git_repository',''))" 2>/dev/null)
  if [[ "$repo" != "$EXPECTED_GIT_REPO" ]]; then
    echo "ERROR: UUID points to '$repo', expected '$EXPECTED_GIT_REPO'" >&2
    exit 1
  fi
}

_api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -sS --fail-with-body -X "$method" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    "$COOLIFY_URL/api/v1${endpoint}" "$@"
}

# --- Commands ---

cmd_info() {
  _require_all; _verify_project
  local app_json
  app_json="$(_api GET "/applications/$COOLIFY_APP_UUID")"
  echo "=== App Info ==="
  echo "$app_json" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for k in ['uuid','name','fqdn','status','build_pack','git_repository','git_branch','ports_exposes']:
    print(f'  {k}: {d.get(k, \"\")}')
"
  echo ""
  echo "=== Env Vars ==="
  _api GET "/applications/$COOLIFY_APP_UUID/envs" \
    | python3 -c "
import sys, json
for e in json.load(sys.stdin):
    if not e.get('is_preview', False):
        v = str(e.get('value',''))
        print(f'  {e[\"key\"]} = {v[:30]}...' if len(v)>30 else f'  {e[\"key\"]} = {v}')
" 2>/dev/null || echo "  (error fetching)"
}

cmd_deploy() {
  _require_all; _verify_project
  echo "Deploying..."
  _api POST "/applications/$COOLIFY_APP_UUID/restart" > /dev/null
  echo "Deploy triggered. Use '$0 wait-deploy' to monitor."
}

cmd_sync_env() {
  _require_all; _verify_project
  local env_file="${1:-$PROJECT_DIR/.env.prod}"
  if [[ ! -f "$env_file" ]]; then
    echo "ERROR: $env_file not found. Create .env.prod with production values." >&2; exit 1
  fi

  echo "Syncing $env_file → Coolify..."
  local json_data
  json_data=$(python3 -c "
import sys, json
data = []
with open(sys.argv[1]) as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' not in line: continue
        key, _, value = line.partition('=')
        key = key.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ('\"', \"'\"):
            value = value[1:-1]
        data.append({'key': key, 'value': value, 'is_preview': False, 'is_literal': True})
print(json.dumps({'data': data}))
" "$env_file")

  local count
  count=$(echo "$json_data" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))")
  _api PATCH "/applications/$COOLIFY_APP_UUID/envs/bulk" -d "$json_data" > /dev/null
  echo "Synced $count variables. Redeploy to apply."
}

cmd_wait_deploy() {
  _require_all
  local timeout="${1:-300}" elapsed=0
  echo "Waiting for deploy (timeout: ${timeout}s)..."
  while (( elapsed < timeout )); do
    local status
    status=$(_api GET "/applications/$COOLIFY_APP_UUID" \
      | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))" 2>/dev/null)
    if [[ "$status" == "running" ]]; then
      echo "Deploy complete (${elapsed}s). Status: running"
      return 0
    fi
    sleep 5
    (( elapsed += 5 ))
    echo "  ${elapsed}s... status: $status"
  done
  echo "ERROR: Deploy timed out after ${timeout}s" >&2; exit 1
}

cmd_push_test() {
  echo "=== Push + Deploy + Smoke ==="
  git push
  "$0" wait-deploy
  "$0" smoke
  echo "=== All done ==="
}

cmd_smoke() {
  if [[ -z "$HEALTH_URL" ]]; then
    echo "HEALTH_URL not set — skipping smoke tests"
    return 0
  fi
  echo "Smoke testing $HEALTH_URL ..."
  local http_code
  http_code=$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL")
  if [[ "$http_code" == "200" ]]; then
    echo "Health check: OK (200)"
  else
    echo "ERROR: Health check returned $http_code" >&2; exit 1
  fi
}

cmd_logs() {
  _require_all
  local lines="${1:-100}"
  _api GET "/applications/$COOLIFY_APP_UUID/logs?limit=$lines" \
    | python3 -c "
import sys, json
try:
    for line in json.load(sys.stdin):
        print(line.get('output', line) if isinstance(line, dict) else line)
except: print(sys.stdin.read())
" 2>/dev/null
}

cmd_prod_release() {
  local tag="${1:-v$(date +%Y%m%d-%H%M%S)-prod}"
  echo "Creating production release: $tag"
  git tag "$tag"
  git push origin "$tag"
  echo "Tag $tag pushed. Coolify will deploy via GitHub Actions (if configured)."
}

# --- Main ---
case "${1:-help}" in
  info)          cmd_info ;;
  deploy)        cmd_deploy ;;
  sync-env)      shift; cmd_sync_env "$@" ;;
  wait-deploy)   shift; cmd_wait_deploy "$@" ;;
  push-test)     cmd_push_test ;;
  smoke)         cmd_smoke ;;
  logs)          shift; cmd_logs "$@" ;;
  prod-release)  shift; cmd_prod_release "$@" ;;
  help|*)
    echo "Usage: $0 {info|deploy|sync-env|wait-deploy|push-test|smoke|logs|prod-release}"
    echo ""
    echo "Commands:"
    echo "  info          Show app status & env vars"
    echo "  deploy        Trigger redeployment"
    echo "  sync-env      Push .env.prod to Coolify"
    echo "  wait-deploy   Wait for deploy (default: 300s timeout)"
    echo "  push-test     Git push → wait → smoke test"
    echo "  smoke         Health check on deployed app"
    echo "  logs          View deployment logs"
    echo "  prod-release  Create & push version tag for prod deploy"
    ;;
esac
