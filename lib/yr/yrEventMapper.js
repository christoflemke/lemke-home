/**
 *
 * @param {YrForecast} yrForecast
 * @return {InfluxPoint[]}
 */
function yrForcastToIPoints (yrForecast) {
  const first = yrForecast.properties.timeseries[0]
  const data = first.data.instant.details
  return [{
    measurement: 'yr_forecast',
    fields: data,
    tags: {}
  }]
}

module.exports = {
  yrForcastToIPoints
}
