#!/usr/bin/env bash
# Verification gate: prisma schema valid + ord-litecoin HTTP smoke (+ optional inscription id).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"

die() {
  echo "verify-inscription-gate: $*" >&2
  exit 1
}

load_env() {
  local f
  for f in "$REPO_ROOT/.env" "$BACKEND_DIR/.env"; do
    if [[ -f "$f" ]]; then
      echo "==> Sourcing $(basename "$f")"
      set -a
      # shellcheck source=/dev/null
      source "$f"
      set +a
      break
    fi
  done
}

load_env

# Prisma CLI still resolves env("DATABASE_URL") in schema during validate.
export DATABASE_URL="${DATABASE_URL:-postgresql://ord_lite_user:ord_lite_pass@127.0.0.1:5432/ord_lite_db}"

ORD_BASE="${ORD_LITECOIN_URL:-http://127.0.0.1:80}"
ORD_BASE="${ORD_BASE%/}"

[[ -d "$BACKEND_DIR" ]] || die "missing backend dir: $BACKEND_DIR"

if [[ ! -d "$BACKEND_DIR/node_modules/@prisma/client" ]]; then
  echo "==> Prisma client missing; run: (cd backend && npm ci && npx prisma generate)" >&2
  die "backend dependencies or prisma generate not done"
fi

echo "==> prisma validate"
(cd "$BACKEND_DIR" && npx prisma validate)

echo "==> ord-litecoin (HEAD /status or GET /inscriptions/block/0/0)"
if ! command -v curl >/dev/null 2>&1; then
  die "curl not found in PATH"
fi

ord_ok=false
if curl -sfS -o /dev/null "$ORD_BASE/status"; then
  ord_ok=true
elif curl -sfS -o /dev/null -H "Accept: application/json" "$ORD_BASE/inscriptions/block/0/0"; then
  ord_ok=true
fi
if [[ "$ord_ok" != true ]]; then
  die "ord-litecoin unreachable — try ORD_LITECOIN_URL=http://127.0.0.1:8080 after: docker compose --profile litecoin up -d (see backend/docker/README.md)"
fi

if [[ -n "${VERIFY_INSCRIPTION_ID:-}" ]]; then
  echo "==> ord-litecoin inscription $VERIFY_INSCRIPTION_ID"
  if ! curl -sfS \
    -H "Accept: application/json" \
    "$ORD_BASE/inscription/$VERIFY_INSCRIPTION_ID" \
    >/dev/null; then
    die "failed to fetch inscription JSON for VERIFY_INSCRIPTION_ID=$VERIFY_INSCRIPTION_ID"
  fi
fi

echo "verify-inscription-gate: OK"
