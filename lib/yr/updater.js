const { getForecastCached } = require('./yrClient')
const { yrForcastToIPoints } = require('./yrEventMapper')
const { influx } = require('../influx')
const config = require('../config').yr

async function update () {
  async function iterate () {
    const response = await getForecastCached()
    const points = yrForcastToIPoints(response)
    if (points.length > 0) {
      console.log(`yr -> influx: ${JSON.stringify(points)}`)
      await influx.writePoints(points)
    }
  }

  await iterate()
  setInterval(iterate, config.interval)
}

module.exports = {
  update
}
