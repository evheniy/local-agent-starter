#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/static";

. "$PWD/workspaces/env.sh"

npx vs -p $CDN_PORT $scriptdir/public
