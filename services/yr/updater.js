const { getForecastCached } = require('./yrClient')
const { yrForcastToIPoints } = require('./yrEventMapper')
const { influx } = require('../../lib/influx')
const config = require('../../lib/config').yr

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

/**
 * @type {DataService}
 */
const service = {
  start: update,
  stop: () => {}
}

module.exports = service
