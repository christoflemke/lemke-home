/**
 * @param {Observation[]} stationFeatures
 * @return {import('influx').IPoint}
 */
function featuresToPoint (stationFeatures) {
  const params = new Set(stationFeatures.map(f => f.properties.parameterId))
  const fields = {}
  for (const param of params) {
    const sortedProps = stationFeatures
      .map(f => f.properties)
      .filter(p => p.parameterId === param)
      .sort((a, b) => new Date(b.observed).getTime() - new Date(a.observed).getTime())
    fields[param] = sortedProps[0].value
  }
  /**
   * @type {import('influx').IPoint}
   */
  const point = {
    measurement: 'dmi.stationData',
    tags: {
      stationId: stationFeatures[0].properties.stationId,
      lon: stationFeatures[0].geometry.coordinates[0].toString(),
      lat: stationFeatures[0].geometry.coordinates[1].toString()
    },
    fields
  }

  return point
}

/**
 *
 * @param {ObservationCollection} observations
 * @return {import('influx').IPoint[]}
 */
function observationsToPoints (observations) {
  const stations = new Set(observations.features.map(f => f.properties.stationId))
  const points = []
  for (const station of stations) {
    const stationFeatures = observations.features.filter(f => f.properties.stationId === station)
    const point = featuresToPoint(stationFeatures)
    points.push(point)
  }
  return points
}

module.exports = {
  observationsToPoints
}
