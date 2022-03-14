/**
 *
 * @param {YrForecast} yrForecast
 * @return {import("influx").IPoint[]}
 */
function yrForcastToIPoints (yrForecast) {
  const first = yrForecast.properties.timeseries[0]
  const data = first.data.instant.details
  return [{
    measurement: 'yr.forecast',
    fields: data
  }]
}

module.exports = {
  yrForcastToIPoints
}
