#!/usr/bin/env sh

: "${API_PORT:=3000}"
: "${UI_PORT:=3001}"
: "${CHAT_PORT:=3002}"
: "${MCP_PORT:=3003}"
: "${DOCS_DIR:=$PWD/docker/docs}"
: "${API:=http://localhost:$API_PORT}"
: "${UI:=http://localhost:$UI_PORT}"
: "${CHAT:=http://localhost:$CHAT_PORT}"
: "${MCP:=http://localhost:$MCP_PORT}"

export API_PORT
export UI_PORT
export CHAT_PORT
export MCP_PORT
export DOCS_DIR
export API
export UI
export CHAT
export MCP
