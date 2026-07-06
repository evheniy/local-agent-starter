#!/usr/bin/env sh

set -e

scriptdir=$PWD/workspaces/mcp
distdir=dist/mcp

printf '%s\n' 'Building Local Agent MCP workspace into dist/mcp...' >&2

NODE_ENV=production \
npx webpack --config $scriptdir/webpack.config.ts

cp $scriptdir/package.json $distdir/package.json
npm pkg delete "type" --prefix $distdir
npm pkg delete "private" --prefix $distdir
