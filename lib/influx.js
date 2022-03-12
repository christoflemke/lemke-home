const Influx = require('influx')
const config = require('./config').influx
const influx = new Influx.InfluxDB(config)

function addSchema (measurement) {
  influx.addSchema(
    {
      measurement,
      fields: {
        value: Influx.FieldType.FLOAT
      },
      tags: [
        'deviceId',
        'name',
        'roomName'
      ]
    }
  )
}

addSchema('TemperatureLevel')
addSchema('valveTappetState')
addSchema('RoomClimateControl')

async function checkAuth () {
  console.log(await influx.getDatabaseNames())
}

module.exports = {
  influx,
  checkAuth
}
