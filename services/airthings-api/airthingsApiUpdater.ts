import {AirthingsClient, SensorUnits} from "airthings-consumer-api";
import config from "../../lib/config.ts";
import {influx} from "../../lib/influx.ts";

async function sample() {
  if (!config.airthings_api.clientId) {
    throw new Error("Missing clientId")
  }
  if (!config.airthings_api.clientSecret) {
    throw new Error("Missing clientSecret")
  }
  const airthingsClient = new AirthingsClient({
    clientId: config.airthings_api.clientId,
    clientSecret: config.airthings_api.clientSecret
  });
  const response = await airthingsClient.getSensors(SensorUnits.Metric)
  const devices = response.results
  for (const device of devices) {
    if (device.sensors.length === 0) {
      continue
    }

    const fields = {}
    for (const sv of device.sensors) {
      fields[sv.sensorType] = sv.value
    }

    const point = {
      measurement: 'airthings_sensorValues',
      tags: {
        serial: device.serialNumber
      },
      fields
    }
    const room = config.airthings_api.devices[device.serialNumber]
    point.tags["room"] = room
    console.log(`Sending: ${JSON.stringify(point)}`)
    influx.writePoints([point])
  }
}

async function start() {
  async function iterate() {
    console.log('update from airthings api')
    try {
      await sample()
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  await iterate()
  setInterval(iterate, 5 * 60 * 1000)
}

start()