#!/bin/bash

set -e

echo 'Please enter the credentials for influx db (default admin:admin)'
read -p 'Influx Username: ' INFLUX_USER
read -sp 'Influx Password: ' INFLUX_PASSWORD
echo -e '\n'
if [ -z "$INFLUX_USER" ]; then
  INFLUX_USER='admin'
fi
if [ -z "$INFLUX_PASSWORD" ]; then
  INFLUX_PASSWORD='admin'
fi

echo 'Please enter the credentials for grafana (default: admin:admin)'
read -p 'Grafana Username: ' GRAFANA_USER
read -sp 'Grafana Password: ' GRAFANA_PASSWORD
echo -e '\n'
if [ -z "$GRAFANA_USER" ]; then
  GRAFANA_USER='admin'
fi
if [ -z "$GRAFANA_PASSWORD" ]; then
  GRAFANA_PASSWORD='admin'
fi

read -p 'Client cert location:' CLIENT_CERT_LOCATION
CLIENT_CERT_LOCATION=$(readlink -f $(eval echo $CLIENT_CERT_LOCATION))

read -p 'Client key location:' CLIENT_KEY_LOCATION
CLIENT_KEY_LOCATION=$(readlink -f $(eval echo $CLIENT_KEY_LOCATION))

read -p 'Bosch bridge IP address:' BOSCH_IP

CLIENT_CERT=$(base64 -w0 "$CLIENT_CERT_LOCATION")
CLIENT_KEY=$(base64 -w0 "$CLIENT_KEY_LOCATION")

cat <<EOF > .env
INFLUX_USER=${INFLUX_USER}
INFLUX_PASSWORD=${INFLUX_PASSWORD}
GRAFANA_USER=${GRAFANA_USER}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}
EOF

cat <<EOF > config/default.json
{
  "bosch": {
    "clientCert": "${CLIENT_CERT}",
    "clientKey": "${CLIENT_KEY}",
    "baseUrl": "https://${BOSCH_IP}:8444"
  },
  "influx": {
    "host": "localhost",
    "username": "${INFLUX_USER}",
    "password": "${INFLUX_PASSWORD}",
    "port": 8086,
    "database": "db0"
  }
}
EOF
