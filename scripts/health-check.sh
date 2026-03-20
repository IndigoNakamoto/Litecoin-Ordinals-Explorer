#!/usr/bin/env bash
# Validates Docker Postgres (from backend compose) and Prisma DB connectivity.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/backend/docker/docker-compose.yml"
BACKEND_DIR="$REPO_ROOT/backend"

die() {
  echo "health-check: $*" >&2
  exit 1
}

[[ -f "$COMPOSE_FILE" ]] || die "missing compose file: $COMPOSE_FILE"

if ! command -v docker >/dev/null 2>&1; then
  die "docker not found in PATH"
fi

echo "==> Docker compose: $COMPOSE_FILE"
docker compose -f "$COMPOSE_FILE" ps

if ! docker compose -f "$COMPOSE_FILE" ps --status running --services | grep -qx postgres; then
  die "service 'postgres' is not running. Start with: docker compose -f $COMPOSE_FILE up -d postgres"
fi

# Default URL matches backend/docker/docker-compose.yml when DATABASE_URL unset
export DATABASE_URL="${DATABASE_URL:-postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:5432/ord_lite_db}"

if [[ ! -d "$BACKEND_DIR/node_modules/@prisma/client" ]]; then
  echo "==> Prisma client missing; run: (cd backend && npm ci && npx prisma generate)" >&2
  die "backend dependencies or prisma generate not done"
fi

echo "==> Prisma DB ping (SELECT 1)"
cd "$BACKEND_DIR"
if ! echo "SELECT 1" | npx prisma db execute --stdin 2>/dev/null; then
  die "prisma db execute failed — check DATABASE_URL and that Postgres accepts connections"
fi

echo "health-check: OK"
