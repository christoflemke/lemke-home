#!/bin/bash

set -e

cd $(dirname $0)
cd ..

read_value() {
  jq -r $1 config/default.json
}

if [ -z "$(which jq)" ]; then
  sudo apt-get update
  sudo apt-get install -y jq
fi

cat <<EOF > .env
INFLUX_USER=$(read_value .influx.user)
INFLUX_PASSWORD=$(read_value .influx.password)
GRAFANA_USER=$(read_value .grafana.defaultUsername)
GRAFANA_PASSWORD=$(read_value .grafana.defaultPassword)
EOF

docker-compose build
docker-compose up -d
