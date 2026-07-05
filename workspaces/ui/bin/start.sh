#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/ui";

. "$PWD/workspaces/env.sh"

npx webpack serve \
--open \
--config $scriptdir/webpack.config.ts \
--port $UI_PORT
