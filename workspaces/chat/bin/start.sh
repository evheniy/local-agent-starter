#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/chat"

. "$PWD/workspaces/env.sh"

{
  printf '%s\n' 'Local Agent Chat streaming server'
  printf '  endpoint: http://localhost:%s/chat\n' "$CHAT_PORT"
  printf '  health:   http://localhost:%s/healthcheck\n' "$CHAT_PORT"
  printf '%s\n' ''
} >&2

NODE_ENV=production LOG_LEVEL=info PORT=$CHAT_PORT tsx watch $scriptdir/index.ts
