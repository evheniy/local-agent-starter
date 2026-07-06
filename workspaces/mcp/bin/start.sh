#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/mcp"

. "$PWD/workspaces/env.sh"

: "${LOG_LEVEL:=info}"
: "${HOST:=0.0.0.0}"
: "${PORT:=$MCP_PORT}"

{
  printf '%s\n' 'Local Agent MCP Streamable HTTP server'
  printf '  endpoint: http://%s:%s/mcp\n' "$HOST" "$PORT"
  printf '  health:   http://%s:%s/healthcheck\n' "$HOST" "$PORT"
  printf '%s\n' ''
  printf 'For local clients on the same host, use http://localhost:%s/mcp.\n' "$PORT"
  printf '%s\n' ''
} >&2

exec env NODE_ENV=production LOG_LEVEL="$LOG_LEVEL" HOST="$HOST" PORT="$PORT" node --import tsx "$scriptdir/index.ts"
