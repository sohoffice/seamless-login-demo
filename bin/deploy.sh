#!/usr/bin/env bash

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
DIR="$BINDIR/.."

echo "Build client"
cd $DIR/client
ng build --aot --prod

echo "Replace server/public with built angular app"
rm -rf "$DIR/server/public/c"
mkdir -p "$DIR/server/public/c"
cp -R $DIR/client/dist/client/* "$DIR/server/public/c"

echo "Build server"
cd $DIR/server
sbt stage deployHeroku