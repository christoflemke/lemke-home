const {AirthingsClient, SensorUnits} = require("airthings-consumer-api");
const config = require('../../lib/config').airthings_api
const {influx} = require('../../lib/influx')
const {observationsToPoints} = require("../dmi/dmiEventMapper");

async function sample() {
  if (!config.clientId) {
    throw new Error("Missing clientId")
  }
  if (!config.clientSecret) {
    throw new Error("Missing clientSecret")
  }
  const airthingsClient = new AirthingsClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret
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