#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/indexer"

. "$PWD/workspaces/env.sh"

{
  printf '%s\n' 'Local Agent Indexer worker'
  printf '  poll interval: %sms\n' "${INDEXER_POLL_MS:-5000}"
  printf '%s\n' ''
} >&2

NODE_ENV=production LOG_LEVEL=info tsx watch $scriptdir/index.ts
