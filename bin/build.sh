#!/usr/bin/env bash

BINDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
DIR="$BINDIR/.."

echo "Build client"
cd $DIR/client
ng build --aot

echo "Replace server/public with built angular app"
rm -rf "$DIR/server/public/*"
mkdir -p "$DIR/server/public"
cp -R $DIR/client/dist/client/* "$DIR/server/public"

echo "Build server"
cd $DIR/server
sbt stage