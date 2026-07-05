#!/usr/bin/env sh

set -e

scriptdir=$PWD/workspaces/api;
distdir=dist/api;

. "$PWD/workspaces/env.sh"

NODE_ENV=production \
npx webpack --config $scriptdir/webpack.config.ts

cp $scriptdir/package.json dist/api/package.json
npm pkg delete "type" --prefix $distdir
npm pkg delete "private" --prefix $distdir
