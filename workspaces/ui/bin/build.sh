#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/ui";

. "$PWD/workspaces/env.sh"

NODE_ENV=production \
npx webpack \
--config $scriptdir/webpack.config.ts
