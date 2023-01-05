const client = require('./dmiClient')
const configuration = require('../config')
const { influx } = require('../influx')
const { observationsToPoints } = require('./dmiEventMapper')
/**
 * @return {Promise<Station>}
 */
async function findNearestStation () {
  const delta = 0.3
  const lon1 = configuration.yr.lon - delta
  const lon2 = configuration.yr.lon + delta
  const lat1 = configuration.yr.lat - delta
  const lat2 = configuration.yr.lat + delta
  const stations = await client.getStations({ bbox: `${lon1},${lat1},${lon2},${lat2}` })

  /**
   * @param {Station} station
   * @return {number} distance
   */
  function distance (station) {
    const lon = station.geometry.coordinates[0]
    const lat = station.geometry.coordinates[1]
    return Math.sqrt(Math.pow(lon - configuration.yr.lon, 2) + Math.pow(lat - configuration.yr.lat, 2))
  }

  const valid = []
  for (const station of stations.features) {
    if (station.properties.operationTo) {
      console.log(`operationTo: ${station.properties.operationTo}`)
      continue
    }
    if (station.properties.status !== 'Active') {
      console.log(`status: ${station.properties.status}`)
      continue
    }
    // @ts-ignore
    station.distance = distance(station)
    valid.push(station)
  }

  // @ts-ignore
  const sorted = valid.sort((a, b) => a.distance - b.distance)

  return sorted[0]
}

/**
 *
 * @param {Station} station
 * @return {Promise<ObservationCollection>}
 */
async function getObservations (station) {
  return await client.getObservations({
    station: station.properties.stationId
  })
}

async function main () {
  try {
    const station = await findNearestStation()

    async function iterate () {
      console.log('update from dmi')
      try {
        const observations = await getObservations(station)
        const points = observationsToPoints(observations)
        if (points.length > 0) {
          await influx.writePoints(points)
          console.log(`dmi->influx: ${JSON.stringify(points)}`)
        }
      } catch (e) {
        console.error(e)
      }
    }

    try {
      await iterate()
    } catch (e) {
      console.error(e)
    }
    setInterval(iterate, 5 * 60 * 1000)
  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  update: main
}
