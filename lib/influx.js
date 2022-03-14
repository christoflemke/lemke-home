const Influx = require('influx')
const config = require('./config').influx
const influx = new Influx.InfluxDB(config)

async function checkAuth () {
  console.log(await influx.getDatabaseNames())
}

module.exports = {
  influx,
  checkAuth
}
