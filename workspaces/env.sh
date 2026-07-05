#!/usr/bin/env sh

: "${API_PORT:=3000}"
: "${UI_PORT:=3001}"
: "${API:=http://localhost:$API_PORT}"
: "${UI:=http://localhost:$UI_PORT}"

export API_PORT
export UI_PORT
export API
export UI
