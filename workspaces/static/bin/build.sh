#!/usr/bin/env sh

set -e

scriptdir="$PWD/workspaces/static";
distdir="$PWD/dist/cdn";

cp -R $scriptdir/public/* $distdir/
