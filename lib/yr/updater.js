const { getForecastCached } = require('./yrClient')
const { yrForcastToIPoints } = require('./yrEventMapper')
const { influx } = require('../influx')
const config = require('../config').yr

async function update () {
  async function iterate () {
    const response = await getForecastCached()
    await influx.writePoints(yrForcastToIPoints(response))
  }

  await iterate()
  setInterval(iterate, config.interval)
}

module.exports = {
  update
}
