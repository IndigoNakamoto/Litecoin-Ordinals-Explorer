#!/usr/bin/env bash
# Run docker compose against backend/docker/docker-compose.yml from any cwd.
# Example: bash scripts/docker-explorer-compose.sh up -d postgres
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec docker compose -f "$ROOT/backend/docker/docker-compose.yml" "$@"
