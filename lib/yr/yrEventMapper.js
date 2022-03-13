/**
 *
 * @param {YrForecast} yrForecast
 * @return {import("influx").IPoint[]}
 */
function yrForcastToIPoints (yrForecast) {
  const first = yrForecast.properties.timeseries[0]
  const data = first.data.instant.details
  return [{
    measurement: `yr.forecast`,
    fields: data
  }]
  return Object.keys(data).map(key => {
    return {
      measurement: `yr.${key}`,
      fields: {
        value: data[key]
      }
    }
  })
}

module.exports = {
  yrForcastToIPoints
}
