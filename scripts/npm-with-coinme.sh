#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROPS="$ROOT/coinme.properties"

if [ -z "${COINME_TOKEN:-}" ] && [ -f "$PROPS" ]; then
  COINME_TOKEN="$(grep '^COINME_TOKEN' "$PROPS" | cut -d= -f2- | tr -d ' \r')"
  export COINME_TOKEN
fi

if [ -z "${COINME_TOKEN:-}" ]; then
  echo "error: COINME_TOKEN is not set and $PROPS was not found." >&2
  echo "Copy coinme.properties.example to coinme.properties and add your token." >&2
  exit 1
fi

cd "$ROOT"
exec npm "$@"
