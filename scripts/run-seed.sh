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

remove_collection() {
  local collection="$1"
  local output

  if output=$(flame rm "${collection}" --force 2>&1); then
    return 0
  fi

  if [[ "${output}" == *"not found"* ]] || [[ "${output}" == *"does not exist"* ]] || [[ "${output}" == *"No documents"* ]]; then
    return 0
  fi

  printf '%s\n' "${output}" >&2
  return 1
}

upload_collection() {
  local json_key="$1"
  local collection="$2"

  jq -e ".${json_key} | if type == \"array\" then . else error(\"Expected ${json_key} to be an array\") end" "${SEED_FILE}" \
    | flame up "${collection}" --idField="id"
}

cd "${REPO_ROOT}"

echo "Using flame emulator target..."
flame use emulator

echo "Cleaning existing generated data..."
for collection in claims gifts children family-links families invites users gift-drives; do
  remove_collection "${collection}"
done

echo "Generating seed data..."
pnpm exec tsx scripts/seed.ts "$@" > "${SEED_FILE}"

echo "Uploading generated data..."
upload_collection "giftDrives" "gift-drives"
upload_collection "users" "users"
upload_collection "invites" "invites"
upload_collection "families" "families"
upload_collection "familyLinks" "family-links"
upload_collection "children" "children"
upload_collection "gifts" "gifts"
upload_collection "claims" "claims"

echo "Seed complete :)"
