#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/api";

. "$PWD/workspaces/env.sh"

NODE_ENV=production \
npx webpack --config $scriptdir/webpack.config.ts

cp $scriptdir/package.json dist/api/package.json
npm pkg delete "type" --prefix dist/api
npm pkg delete "private" --prefix dist/api
