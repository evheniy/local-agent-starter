#!/usr/bin/env sh

: "${API_PORT:=3000}"
: "${CDN_PORT:=3001}"
: "${UI_PORT:=3002}"
: "${API:=http://localhost:$API_PORT}"
: "${CDN:=http://localhost:$CDN_PORT}"
: "${UI:=http://localhost:$UI_PORT}"

export API_PORT
export CDN_PORT
export UI_PORT
export API
export CDN
export UI
