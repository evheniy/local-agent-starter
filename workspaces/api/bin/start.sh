#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/api";

. "$PWD/workspaces/env.sh"

echo "Demo:
$API/
"
echo "Prerender:
$API/prerender?name=Developer&title=Senior%20IT%20Professional&avatarUrl=http://localhost:3001/avatar.svg
"
echo "Semantic:
$API/semantic?name=Developer&title=Senior%20IT%20Professional&avatarUrl=http://localhost:3001/avatar.svg
"
echo "Manifest:
$API/manifest.yml
"

NODE_ENV=production LOG_LEVEL=info PORT=$API_PORT tsx watch $scriptdir/index.ts
