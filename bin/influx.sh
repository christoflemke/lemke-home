#!/bin/bash

influx_container_id=$(docker ps -q --filter 'ancestor=influxdb:1.7.11')
docker exec -ti $influx_container_id influx