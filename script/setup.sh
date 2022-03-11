#!/bin/bash

set -e

cd $(dirname $0)
cd ..

if [ ! -f .env ]; then
  echo 'missing .env, run ./script/configure.sh first'
fi

if [ ! -f config/default.json ]; then
  echo 'missing config/default.json, run ./script/configure.sh first'
fi
docker-compose build
docker-compose up -d