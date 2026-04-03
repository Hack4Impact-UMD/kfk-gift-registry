#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SEED_FILE="$(mktemp "${TMPDIR:-/tmp}/kfk-seed.XXXXXX.json")"

cleanup() {
  rm -f "${SEED_FILE}"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

trap cleanup EXIT

require_command flame
require_command jq
require_command pnpm

cd "${REPO_ROOT}"

echo "Using flame emulator target..."
flame use emulator

echo "Cleaning existing generated data..."
for collection in claims gifts children family-links families users gift-drives; do
  flame rm "${collection}" --force || true
done

echo "Generating seed data..."
pnpm exec tsx scripts/seed.ts "$@" > "${SEED_FILE}"

echo "Uploading generated data..."
jq '.giftDrives' "${SEED_FILE}" | flame up gift-drives --idField="id"
jq '.users' "${SEED_FILE}" | flame up users --idField="id"
jq '.families' "${SEED_FILE}" | flame up families --idField="id"
jq '.familyLinks' "${SEED_FILE}" | flame up family-links --idField="id"
jq '.children' "${SEED_FILE}" | flame up children --idField="id"
jq '.gifts' "${SEED_FILE}" | flame up gifts --idField="id"
jq '.claims' "${SEED_FILE}" | flame up claims --idField="id"

echo "Seed complete."
