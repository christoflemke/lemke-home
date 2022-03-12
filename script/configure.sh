#!/bin/bash

set -eu

source .master.env

if [ -z "$INFLUX_USER" ]; then
  INFLUX_USER='admin'
fi
if [ -z "$INFLUX_PASSWORD" ]; then
  INFLUX_PASSWORD='admin'
fi

if [ -z "$GRAFANA_USER" ]; then
  GRAFANA_USER='admin'
fi
if [ -z "$GRAFANA_PASSWORD" ]; then
  GRAFANA_PASSWORD='admin'
fi

CLIENT_CERT_LOCATION=$(readlink -f $(eval echo $CLIENT_CERT_LOCATION))
CLIENT_KEY_LOCATION=$(readlink -f $(eval echo $CLIENT_KEY_LOCATION))
CLIENT_CERT=$(base64 -w0 "$CLIENT_CERT_LOCATION")
CLIENT_KEY=$(base64 -w0 "$CLIENT_KEY_LOCATION")

cat <<EOF > .env
INFLUX_USER=${INFLUX_USER}
INFLUX_PASSWORD=${INFLUX_PASSWORD}
GRAFANA_USER=${GRAFANA_USER}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
EOF

createConfig() {
  INFLUX_HOST=$1
  cat <<EOF
{
  "bosch": {
    "clientCert": "${CLIENT_CERT}",
    "clientKey": "${CLIENT_KEY}",
    "baseUrl": "https://${BOSCH_IP}:8444"
  },
  "influx": {
    "host": "${INFLUX_HOST}",
    "username": "${INFLUX_USER}",
    "password": "${INFLUX_PASSWORD}",
    "port": 8086,
    "database": "db0"
  },
  "airthings": {
      "username": "${AIRTHINGS_USER}",
      "password": "${AIRTHINGS_PASSWORD}",
      "intervalSeconds": 60
    }
}
EOF
}

createConfig localhost > config/default.json
createConfig influxdb > config/docker.json